import { Component, OnInit, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { AppService } from '../app.service';

const { Canvas, Group, Rect, Line, Circle, Ellipse, Path, Polygon, Polyline, Triangle, Point } = fabric

const
  RL_VIEW_WIDTH = 120,
  RL_VIEW_HEIGHT = 60,
  RL_FILL = '#FFF',
  RL_STROKE = '#000',
  RL_CHAIR_STROKE = '#999',
  RL_CHAIR_FILL = '#FFF',
  RL_CHAIR_TUCK = 6,
  RL_FOOT = 12,
  RL_AISLEGAP = 12 * 3,
  RL_ROOM_OUTER_SPACING = 12,
  RL_ROOM_INNER_SPACING = 4,
  RL_ROOM_STROKE = '#666',
  RL_DISABLED = { hasControls: false, selectable: false },
  RL_CORNER_FILL = '#88f'

let
  RL_ROOM_SIZE = { width: 960, height: 480 },
  RL_DEFAULT_CHAIR = null,
  RL_CTRL_KEY_DOWN = false,
  RL_MOVE_WALL_ID = -1



@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class ViewComponent implements OnInit, AfterViewInit {

  view: fabric.Canvas;
  room: fabric.Group
  roomLayer: fabric.Group | fabric.Rect;

  corners = []
  walls: fabric.Line[] = []

  lastObjectDefinition = null;
  lastObject = null;

  constructor(public app: AppService) { }

  onKeyDown(event: KeyboardEvent) {
    // Ctrl Key is down
    if (event.ctrlKey) {
      RL_CTRL_KEY_DOWN = true
      // Ctrl + Shift + Z
      if (event.shiftKey && event.keyCode === 90) this.app.redo()
      // Ctrl + Z
      else if (event.keyCode === 90) this.app.undo()
      // Ctrl + C
      else if (event.keyCode === 67) this.app.copy()
      // Ctrl + V
      else if (event.keyCode === 86) this.paste()
      // Ctrl + Left arrow
      else if (event.keyCode === 37) this.rotate()
      // Ctrl + Right arrow
      else if (event.keyCode === 39) this.rotate(false)
      // Ctrl + G
      else if (event.keyCode === 71) this.group()
    }
    // Delete
    else if (event.keyCode === 46) this.delete()
    // Left Arrow
    else if (event.keyCode === 37) this.move('LEFT')
    // Up Arrow
    else if (event.keyCode === 38) this.move('UP')
    // Right Arrow
    else if (event.keyCode === 39) this.move('RIGHT')
    // Down Arrow
    else if (event.keyCode === 40) this.move('DOWN')
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      RL_CTRL_KEY_DOWN = false
    }
  }

  ngOnInit() {

    this.app.roomEdition.subscribe(state => {
      this.corners.forEach(c => this.setCornerStyle(c))
      this.drawRoom()
      if (state) {
        this.editRoom()
      } else {
        this.cancelRoomEdition()
      }
    })

    this.app.insertObject.subscribe(res => {
      this.handleObjectInsertion(res)
      this.saveState()
    })

    this.app.defaultChair.subscribe(res => RL_DEFAULT_CHAIR = res)

    this.app.performOperation.subscribe(operation => {
      if (operation === 'UNDO')
        this.undo()
      else if (operation === 'REDO')
        this.redo()
      else if (operation === 'COPY')
        this.copy()
      else if (operation === 'PASTE')
        this.paste()
      else if (operation === 'DELETE')
        this.delete()
      else if (operation === 'ROTATE')
        this.rotate()
      else if (operation === 'ROTATE_ANTI')
        this.rotate(false)
      else if (operation === 'GROUP')
        this.group()
      else if (operation === 'UNGROUP')
        this.ungroup()
      else if (operation === 'HORIZONTAL' || operation === 'VERTICAL')
        this.placeInCenter(operation)
      else if (operation === 'ROOM_OPERATION')
        this.drawRoom()
    })
  }

  ngAfterViewInit() {
    /** Initialize canvas */
    this.setCanvasView()
    /** Add room */
    this.setRoom(RL_ROOM_SIZE)
    this.saveState()
  }

  get room_origin() {
    return RL_ROOM_OUTER_SPACING + RL_ROOM_INNER_SPACING
  }

  /**
   * Canvas Init
   */
  setCanvasView() {
    const canvas = new Canvas('main')
    canvas.setWidth(RL_VIEW_WIDTH * RL_FOOT)
    canvas.setHeight(RL_VIEW_HEIGHT * RL_FOOT)
    // canvas.
    this.view = canvas

    const determineUngroup = () => {
      if (this.app.selections.length > 1) {
        this.app.ungroupable = false
        return
      }

      const obj = this.view.getActiveObject()
      const type = obj.name ? obj.name.split(':')[0] : ''
      if (type === 'CHAIR' || type === 'MISCELLANEOUS') {
        this.app.ungroupable = false
      } else {
        this.app.ungroupable = true
      }
    }

    const cornersOfWall = (obj: fabric.Line) => {
      const id = Number(obj.name.split(':')[1])
      const v1Id = id
      const v1 = this.corners[v1Id]
      const v2Id = (id + 1) % this.walls.length
      const v2 = this.corners[v2Id]
      return { v1, v1Id, v2, v2Id }
    }

    this.view.on('selection:created', (e: fabric.IEvent) => {
      if (this.app.roomEdit)
        return
      const active = this.view.getActiveObject()
      active.lockScalingX = true, active.lockScalingY = true
      this.app.selections = this.view.getActiveObjects()
      determineUngroup()
    })

    this.view.on('selection:cleared', (e: fabric.IEvent) => {
      if (this.app.roomEdit)
        return
      this.app.selections = []
      this.app.ungroupable = false
    })

    this.view.on('selection:updated', (e: fabric.IEvent) => {
      if (this.app.roomEdit)
        return
      const active = this.view.getActiveObject()
      active.lockScalingX = true, active.lockScalingY = true
      this.app.selections = this.view.getActiveObjects()
      determineUngroup()
    })

    this.view.on('object:moved', () => {
      if (RL_MOVE_WALL_ID !== -1) {
        RL_MOVE_WALL_ID = -1
        // for (let i = 0; i < this.walls.length; i++) {
        //   let f = false
        //   for (let j = i + 1; j < this.walls.length; j++) {
        //     if (this.walls[i].intersectsWithObject(this.walls[j])) {
        //       this.undo()
        //       return
        //     }
        //   }
        // }
      }
      this.saveState()
    })
    this.view.on('object:rotated', () => this.saveState())

    this.view.on('mouse:down:before', (e: fabric.IEvent) => {
      const obj = e.target

      if (this.app.roomEdit && this.app.roomEditOperate === 'WALL' && obj && obj.name.indexOf('WALL') > -1 && obj instanceof Line) {
        let { v1, v2, v1Id, v2Id } = cornersOfWall(obj)
        const v0Id = (v1Id === 0) ? this.corners.length - 1 : v1Id - 1
        const v3Id = (v2Id === this.corners.length - 1) ? 0 : v2Id + 1
        const v0 = this.corners[v0Id]
        const v3 = this.corners[v3Id]

        RL_MOVE_WALL_ID = v1Id

        if ((v0.top === v1.top && v1.top === v2.top) || (v0.left === v1.left && v1.left === v2.left)) {
          this.corners.splice(v1Id, 0, this.drawCorner(new Point(v1.left, v1.top)))
          RL_MOVE_WALL_ID = v1Id + 1
          v2Id += 1
        }
        if ((v1.top === v2.top && v2.top === v3.top) || (v1.left === v2.left && v2.left === v3.left)) {
          this.corners.splice(v2Id + 1, 0, this.drawCorner(new Point(v2.left, v2.top)))
        }
        this.drawRoom()
        this.saveState()
      }
    })

    this.view.on('object:moving', (e: fabric.IEvent) => {
      if (RL_MOVE_WALL_ID !== -1) {
        const p = e['pointer']
        const v1 = this.corners[RL_MOVE_WALL_ID]
        const v2 = this.corners[(RL_MOVE_WALL_ID + 1) % this.corners.length]
        const direction = v1.left === v2.left ? 'HORIZONTAL' : 'VERTICAL'

        if (p.y < RL_ROOM_OUTER_SPACING) p.y = RL_ROOM_OUTER_SPACING
        if (p.x < RL_ROOM_OUTER_SPACING) p.x = RL_ROOM_OUTER_SPACING

        if (direction === 'VERTICAL') {
          v1.top = v2.top = p.y
        } else {
          v1.left = v2.left = p.x
        }
        this.drawRoom()
      }
    })

    this.view.on('mouse:up', (e: fabric.IEvent) => {
      const obj = e.target
      if (this.app.roomEdit && this.app.roomEditOperate === 'CORNER' && obj && obj.name.indexOf('WALL') > -1 && obj instanceof Line) {
        const p = e['pointer']
        const { v1, v1Id, v2, v2Id } = cornersOfWall(obj)
        const ind = v1Id < v2Id ? v1Id : v2Id
        if (v1.left === v2.left)
          p.x = v1.left
        else if (v1.top === v2.top)
          p.y = v1.top
        const newCorner = this.drawCorner(new Point(p.x, p.y))
        if (Math.abs(v1Id - v2Id) != 1) this.corners.push(newCorner)
        else this.corners.splice(ind + 1, 0, newCorner)

        this.drawRoom()
        this.saveState()
      }
    })
  }

  /**
   * Function to change the room
   * @param room : Object to represent a room
   */
  setRoom({ title = 'default', width, height }) {

    if (this.walls.length) {
      this.view.remove(...this.walls)
      this.view.renderAll()
    }

    const LT = new Point(RL_ROOM_OUTER_SPACING, RL_ROOM_OUTER_SPACING)
    const RT = new Point(LT.x + width, LT.y)
    const LB = new Point(LT.x, LT.y + height)
    const RB = new Point(RT.x, LB.y)

    this.corners = [LT, RT, RB, LB].map(p => this.drawCorner(p))

    this.drawRoom()
  }

  setCornerStyle(c: fabric.Circle) {
    c.moveCursor = this.view.freeDrawingCursor
    c.hoverCursor = this.view.freeDrawingCursor
    c.selectable = false
    c.evented = false
    c.set('radius', RL_ROOM_INNER_SPACING / (this.app.roomEdit ? 1 : 2))
    c.set('fill', this.app.roomEdit ? RL_CORNER_FILL : RL_ROOM_STROKE)
  }

  drawCorner(p: fabric.Point) {
    const c = new Circle({
      left: p.x,
      top: p.y,
      strokeWidth: 0,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      name: 'CORNER'
    })
    this.setCornerStyle(c)
    return c
  }

  drawRoom() {

    const exists = this.view.getObjects().filter(obj => obj.name.indexOf('WALL') > -1 || obj.name === 'CORNER')
    this.view.remove(...exists)

    this.view.add(...this.corners)

    const wall = (coords: number[], index: number) => new Line(coords, {
      stroke: RL_ROOM_STROKE,
      strokeWidth: RL_ROOM_INNER_SPACING,
      name: `WALL:${index}`,
      originX: 'center',
      originY: 'center',
      hoverCursor: this.app.roomEdit ? (this.app.roomEditOperate === 'CORNER' ? 'pointer' : this.view.moveCursor) : this.view.defaultCursor,
      hasControls: false,
      hasBorders: false,
      selectable: this.app.roomEdit,
      evented: this.app.roomEdit,
      lockMovementX: this.app.roomEditOperate !== 'WALL',
      lockMovementY: this.app.roomEditOperate !== 'WALL'
    })

    let LT = new Point(9999, 9999), RB = new Point(0, 0)

    this.walls = this.corners.map((corner, i) => {
      const start = corner
      const end = (i === this.corners.length - 1) ? this.corners[0] : this.corners[i + 1]

      if (corner.top < LT.x && corner.left < LT.y) LT = new Point(corner.left, corner.top)
      if (corner.top > RB.y && corner.left > RB.y) RB = new Point(corner.left, corner.top)

      const w = wall([start.left, start.top, end.left, end.top], i)
      return w
    })

    this.view.add(...this.walls)
    this.walls.forEach(w => w.sendToBack())
    RL_ROOM_SIZE = { width: RB.x - LT.x, height: RB.y - LT.y }
  }

  editRoom() {
    this.view.getObjects().forEach(r => {
      if (r.name.indexOf('WALL') === -1 && r.name !== 'CORNER') {
        r.selectable = false
        r.evented = false
        r.opacity = 0.3
      }
    })
    if (this.app.roomEditStates.length === 0)
      this.saveState()
  }

  cancelRoomEdition() {
    this.view.getObjects().forEach(r => {
      if (r.name.indexOf('WALL') === -1 && r.name !== 'CORNER') {
        r.selectable = true
        r.evented = true
        r.opacity = 1
      }
    })
  }

  handleObjectInsertion({ type, object }) {

    if (type === 'ROOM') {
      this.setRoom(object)
      return
    }

    let group;

    if (type === 'CHAIR') {
      group = this.createShape(object)
    } else if (type === 'MISCELLANEOUS') {
      group = this.createShape(object, RL_STROKE, RL_FILL, type)
    } else if (type === 'TABLE') {
      group = this.createTable(object)
    }

    // retrieve spacing from object, use rlAisleGap if not specified
    const newLR = object.lrSpacing || RL_AISLEGAP;
    const newTB = object.tbSpacing || RL_AISLEGAP;

    // object groups use center as origin, so add half width and height of their reported
    // width and size; note that this will not account for chairs around tables, which is
    // intentional; they go in the specified gaps
    group.left = newLR + (group.width / 2) + this.room_origin;
    group.top = newTB + (group.height / 2) + this.room_origin;

    if (this.lastObject) {
      // retrieve spacing from object, use rlAisleGap if not specified
      const lastLR = this.lastObjectDefinition.lrSpacing || RL_AISLEGAP;
      const lastTB = this.lastObjectDefinition.tbSpacing || RL_AISLEGAP;

      // calculate maximum gap required by last and this object
      // Note: this isn't smart enough to get new row gap right when 
      // object above had a much bigger gap, etc. We aren't fitting yet.
      const useLR = Math.max(newLR, lastLR), useTB = Math.max(newTB, lastTB);

      // using left/top vocab, though all objects are now centered
      let newLeft = this.lastObject.left + this.lastObjectDefinition.width + useLR;
      let newTop = this.lastObject.top;

      // make sure we fit left to right, including our required right spacing
      if (newLeft + group.width + newLR > RL_ROOM_SIZE.width) {
        newLeft = newLR + (group.width / 2);
        newTop += this.lastObjectDefinition.height + useTB;
      }

      group.left = newLeft;
      group.top = newTop;

      if ((group.left - group.width / 2) < this.room_origin) group.left += this.room_origin
      if ((group.top - group.height / 2) < this.room_origin) group.top += this.room_origin
    }

    this.view.add(group)
    this.view.setActiveObject(group)

    this.lastObject = group
    this.lastObjectDefinition = object
  }



  /** Adding Chairs */
  createShape(object: any, stroke = RL_CHAIR_STROKE, fill = RL_CHAIR_FILL, type: string = 'CHAIR') {

    if (!object.parts) {
      return {}
    }

    const parts = object.parts.map(obj => this.createBasicShape(obj, stroke, fill))
    const group = new Group(parts, {
      name: `${type}:${object.title}`,
      hasControls: false,
      originX: 'center',
      originY: 'center'
    })

    return (group)
  }


  // All Create[Name]Object() functions should return a group

  createTable(def: any, type: string = 'TABLE') {
    // tables with chairs have the chairs full-height around the table

    const components = [];
    let index = 0;

    // Note that we're using the provided width and height for table placement
    // Issues may arise if rendered shape is larger/smaller, since it's positioned from center point
    const chairWidth = RL_DEFAULT_CHAIR.width;
    const chairHeight = RL_DEFAULT_CHAIR.height;
    const tableLeft = def.leftChairs > 0 ? (chairHeight - RL_CHAIR_TUCK) : 0;
    const tableTop = (chairHeight - RL_CHAIR_TUCK);

    if (def.shape == 'circle') {

      const origin_x = def.width / 2 + chairHeight - RL_CHAIR_TUCK;
      const origin_y = def.width / 2 + chairHeight - RL_CHAIR_TUCK;
      const x2 = origin_x;
      const y2 = 0 + chairHeight / 2;

      const rotation_origin = new fabric.Point(origin_x, origin_y);

      const tableRadius = def.width / 2;
      const radius = def.width / 2 + chairHeight;   // outer radius of whole shape unit
      let angle = 0;
      const angleIncrement = 360 / (def.chairs > 0 ? def.chairs : 1);

      for (let x = 0; x < def.chairs; ++x) {
        // Note that width and height are the same for circle tables
        // width of whole area when done
        const width = def.width + chairHeight - (RL_CHAIR_TUCK * 2);

        components[index] = this.createShape(RL_DEFAULT_CHAIR, RL_CHAIR_STROKE, RL_CHAIR_FILL);

        const angle_radians = fabric.util.degreesToRadians(angle);
        const end = fabric.util.rotatePoint(new fabric.Point(x2, y2), rotation_origin, angle_radians);
        components[index].left = end.x;
        components[index].top = end.y;
        components[index].angle = (angle + 180 > 360) ? (angle - 180) : (angle + 180);
        index++;
        angle += angleIncrement;
      }

      const tableCircle = {
        left: origin_x,
        top: origin_y,
        radius: tableRadius,
        fill: RL_FILL,
        stroke: RL_STROKE,
        originX: 'center',
        originY: 'center',
        name: 'DESK'
      };
      components[index] = new fabric.Circle(tableCircle);

    } else if (def.shape == 'rect') {
      const tableRect = {
        width: def.width,
        height: def.height,
        fill: RL_FILL,
        stroke: RL_STROKE,
        name: 'DESK'
      };

      // calculate gap between chairs, with extra for gap to end of table
      let gap = 0, firstOffset = 0, leftOffset = 0, topOffset = 0;

      // top chair row
      // Note that chairs 'look up' by default, so the bottom row isn't rotated
      // and the top row is.
      gap = (def.width - (def.topChairs * chairWidth)) / (def.topChairs + 1);
      firstOffset = gap + tableLeft;
      leftOffset = firstOffset;
      topOffset = 0;

      for (let x = 0; x < def.topChairs; x++) {
        components[index] = this.createShape(RL_DEFAULT_CHAIR, RL_CHAIR_STROKE, RL_CHAIR_FILL);
        components[index].angle = -180;
        components[index].left = leftOffset + chairWidth / 2;
        components[index].top = topOffset + chairHeight / 2;
        index++;

        leftOffset += (chairWidth + gap);
      }

      // bottom chair row
      gap = (def.width - (def.bottomChairs * chairWidth)) / (def.bottomChairs + 1);
      firstOffset = gap + tableLeft;
      leftOffset = firstOffset;
      topOffset = tableRect.height + chairHeight - (RL_CHAIR_TUCK * 2);

      for (let x = 0; x < def.bottomChairs; x++) {
        components[index] = this.createShape(RL_DEFAULT_CHAIR, RL_CHAIR_STROKE, RL_CHAIR_FILL);
        components[index].left = leftOffset + chairWidth / 2;
        components[index].top = topOffset + chairWidth / 2;
        ++index;

        leftOffset += (chairWidth + gap);
      }

      // left chair row
      gap = (def.height - (def.leftChairs * chairWidth)) / (def.leftChairs + 1);
      leftOffset = chairWidth / 2;
      topOffset = tableTop + gap + chairWidth / 2;  // top of table plus first gap, then to center

      for (let x = 0; x < def.leftChairs; x++) {
        components[index] = this.createShape(RL_DEFAULT_CHAIR, RL_CHAIR_STROKE, RL_CHAIR_FILL);
        components[index].angle = 90;
        components[index].left = leftOffset;
        components[index].top = topOffset;
        ++index;

        topOffset += (chairWidth + gap);
      }

      // right chair row
      gap = (def.height - (def.rightChairs * chairWidth)) / (def.rightChairs + 1);
      leftOffset = tableRect.width + chairWidth / 2;
      topOffset = tableTop + gap + chairWidth / 2;  // top of table plus first gap, then to center

      for (let x = 0; x < def.rightChairs; x++) {
        components[index] = this.createShape(RL_DEFAULT_CHAIR, RL_CHAIR_STROKE, RL_CHAIR_FILL);
        components[index].angle = -90;
        components[index].left = leftOffset + chairHeight - (RL_CHAIR_TUCK * 2);
        components[index].top = topOffset;
        ++index;

        topOffset += (chairWidth + gap);
      }

      // add table on top of chairs
      components[index] = new fabric.Rect(tableRect);
      components[index].left = tableLeft;
      components[index].top = tableTop;
    }

    const tableGroup = new fabric.Group(components, {
      left: 0,
      top: 0,
      hasControls: false,
      // set origin for all groups to center
      originX: 'center',
      originY: 'center',
      name: `${type}:${def.title}`
    });

    return tableGroup;
  }


  /** Create Basic Shape  */
  createBasicShape(part: any, stroke: string = '#aaaaaa', fill: string = 'white') {
    if (part.definition.fill == null) part.definition.fill = fill;

    if (part.definition.stroke == null) part.definition.stroke = stroke;
    else if (part.definition.stroke == 'chair') part.definition.stroke = RL_CHAIR_STROKE;

    // lines and paths need origin set to center
    // if (part.type === 'line' || part.type === 'path') {
    // part.definition.originX = 'center';
    // part.definition.originY = 'center';
    // }

    let fObj

    switch (part.type) {
      case 'circle':
        fObj = new Circle(part.definition)
        break
      case 'ellipse':
        fObj = new Ellipse(part.definition)
        break
      case 'line':
        fObj = new Line(part.line, part.definition)
        break
      case 'path':
        fObj = new Path(part.path, part.definition)
        break
      case 'polygon':
        fObj = new Polygon(part.definition)
        break
      case 'polyline':
        fObj = new Polyline(part.definition)
        break
      case 'rect':
        fObj = new Rect(part.definition);
        break
      case 'triangle':
        fObj = new Triangle(part.definition);
        break
    }

    return (fObj)
  }

  /** Save current state */
  saveState() {
    const state = this.view.toDatalessJSON(['name', 'hasControls', 'selectable', 'hasBorders', 'evented', 'hoverCursor', 'moveCursor'])
    this.app.saveState.next(JSON.stringify(state))
  }


  undo() {
    let current = null

    if (this.app.roomEdit) {
      const state = this.app.roomEditStates.pop()
      this.app.roomEditRedoStates.push(state)
      current = this.app.roomEditStates[this.app.roomEditStates.length - 1]
    } else {
      const state = this.app.states.pop()
      this.app.redoStates.push(state)
      current = this.app.states[this.app.states.length - 1]
    }

    this.view.clear()
    this.view.loadFromDatalessJSON(current, () => {
      this.view.renderAll()
      this.corners = this.view.getObjects().filter(obj => obj.name === 'CORNER')
      this.drawRoom()
    })
  }


  /** Redo operation */
  redo() {
    let current = null

    if (this.app.roomEdit) {
      current = this.app.roomEditRedoStates.pop()
      this.app.roomEditStates.push(current)
    } else {
      current = this.app.redoStates.pop()
      this.app.states.push(current)
    }

    this.view.clear()
    this.view.loadFromDatalessJSON(current, () => {
      this.view.renderAll()
      this.corners = this.view.getObjects().filter(obj => obj.name === 'CORNER')
      this.drawRoom()
    })
  }


  /** Copy operation */
  copy() {
    if (this.app.roomEdit)
      return
    const active = this.view.getActiveObject()
    if (!active) {
      return
    }
    active.clone(cloned => this.app.copied = cloned, ['name', 'hasControls'])
  }

  /** Paste operation */
  paste() {
    if (!this.app.copied || this.app.roomEdit) {
      return
    }
    this.app.copied.clone((cloned) => {
      this.view.discardActiveObject()
      cloned.set({
        left: cloned.left + RL_AISLEGAP,
        top: cloned.top + RL_AISLEGAP
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = this.view
        cloned.forEachObject(obj => this.view.add(obj))
        cloned.setCoords()
      } else {
        this.view.add(cloned)
      }
      this.app.copied.top += RL_AISLEGAP
      this.app.copied.left += RL_AISLEGAP
      this.view.setActiveObject(cloned)
      this.view.requestRenderAll()
      this.saveState()
    }, ['name', 'hasControls'])
  }

  /** Delete operation */
  delete() {
    if (this.app.roomEdit)
      return
    this.app.selections.forEach(selection => this.view.remove(selection))
    this.view.discardActiveObject()
    this.view.requestRenderAll()
    this.saveState()
  }

  /** Rotate Operation */
  rotate(clockwise = true) {
    if (this.app.roomEdit)
      return

    let angle = RL_CTRL_KEY_DOWN ? 90 : 15
    const obj = this.view.getActiveObject()

    if (!obj) return

    if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
      obj.originX = 'center'
      obj.originY = 'center'
      obj.left += obj.width / 2
      obj.top += obj.height / 2
    }

    angle = obj.angle + (clockwise ? angle : -angle)

    if (angle > 360) angle -= 360
    else if (angle < 0) angle += 360

    obj.angle = angle
    this.view.requestRenderAll()
  }

  /** Group */
  group() {
    if (this.app.roomEdit)
      return

    const active = this.view.getActiveObject()
    if (!(this.app.selections.length > 1 && active instanceof fabric.ActiveSelection))
      return

    active.toGroup()
    active.lockScalingX = true, active.lockScalingY = true
    this.view.requestRenderAll()
    this.saveState()
  }

  ungroup() {
    if (this.app.roomEdit)
      return

    const active = this.view.getActiveObject()
    if (!(active && active instanceof fabric.Group))
      return

    active.toActiveSelection()
    active.lockScalingX = true, active.lockScalingY = true
    this.view.requestRenderAll()
    this.saveState()
  }

  move(direction, increament = 6) {
    if (this.app.roomEdit)
      return

    const active = this.view.getActiveObject()
    if (!active)
      return
    switch (direction) {
      case 'LEFT':
        active.left -= increament
        break
      case 'UP':
        active.top -= increament
        break
      case 'RIGHT':
        active.left += increament
        break
      case 'DOWN':
        active.top += increament
        break
    }
    this.view.requestRenderAll()
    this.saveState()
  }

  placeInCenter(direction) {
    const active = this.view.getActiveObject()
    // const svg = active.toSVG()

    if (!active)
      return

    if (direction === 'HORIZONTAL') {
      active.left = RL_ROOM_SIZE.width / 2 - (active.originX === 'center' ? 0 : active.width / 2)
    } else {
      active.top = RL_ROOM_SIZE.height / 2 - (active.originX === 'center' ? 0 : active.height / 2)
    }

    active.setCoords()
    this.view.requestRenderAll()
    this.saveState()
  }

}
