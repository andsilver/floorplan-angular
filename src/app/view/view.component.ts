import { Component, OnInit, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { AppService } from '../app.service';

const { Canvas, Group, Rect, Line, Circle, Ellipse, Path, Polygon, Polyline, Triangle } = fabric

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
  RL_ROOM_STROKE = '#222',
  RL_ROOM_FILL = '#FFF',
  RL_DISABLED = { hasControls: false, selectable: false, hasBorders: false, evented: false }

let
  RL_ROOM_SIZE = { width: 960, height: 480 },
  RL_DEFAULT_CHAIR = null



@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, AfterViewInit {

  view: fabric.Canvas;
  room: fabric.Path | fabric.Rect;
  roomLayer: fabric.Group | fabric.Rect;

  lastObjectDefinition = null;
  lastObject = null;

  constructor(public app: AppService) { }

  ngOnInit() {
    this.app.insertObject.subscribe(res => {
      this.handleObjectInsertion(res)
      this.saveState()
    })
    this.app.defaultChair.subscribe(res => RL_DEFAULT_CHAIR = res)
    this.app.performOperation.subscribe(operation => {
      if (operation === 'UNDO') {
        const state = this.app.states[this.app.states.length - 1]
        this.app.redoStates.push(state)
        this.app.states.pop()
        this.view.clear()
        this.view.loadFromDatalessJSON(this.app.states[this.app.states.length - 1], () => {
          this.view.renderAll()
          this.roomLayer = this.view._objects.find(obj => obj.name.indexOf('ROOM') > -1)
        })
      } else if (operation === 'REDO') {
        const state = this.app.redoStates[this.app.redoStates.length - 1]
        this.app.redoStates.pop()
        this.app.states.push(state)
        this.view.clear()
        this.view.loadFromDatalessJSON(state, () => {
          this.view.renderAll()
          this.roomLayer = this.view._objects.find(obj => obj.name.indexOf('ROOM') > -1)
        })
      }
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
    this.view = canvas

    this.view.on('object:selected', (e: fabric.IEvent) => {
      console.log(e)
    })
  }

  /**
   * Function to change the room
   * @param room : Object to represent a room
   */
  setRoom({ title = 'default', width, height }) {

    if (this.room) {
      this.view.remove(this.roomLayer)
    }

    this.room = new Rect({
      width: width,
      height: height,
      stroke: RL_ROOM_STROKE,
      strokeWidth: RL_ROOM_INNER_SPACING,
      fill: RL_ROOM_FILL,
    })

    this.room.top = RL_ROOM_OUTER_SPACING
    this.room.left = RL_ROOM_OUTER_SPACING
    this.roomLayer = new fabric.Group([this.room], { name: `ROOM:${title}`, ...RL_DISABLED })
    this.view.add(this.roomLayer)

    this.roomLayer.sendToBack()
    RL_ROOM_SIZE = { width, height }
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
      group = this.createShape(object, RL_STROKE, RL_FILL)
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

      const tableCircle = { left: origin_x, top: origin_y, radius: tableRadius, fill: RL_FILL, stroke: RL_STROKE, originX: 'center', originY: 'center' };
      components[index] = new fabric.Circle(tableCircle);

    } else if (def.shape == 'rect') {
      const tableRect = { width: def.width, height: def.height, fill: RL_FILL, stroke: RL_STROKE };

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

  // Save current state
  saveState() {
    const state = this.view.toDatalessJSON(['name', 'hasControls', 'selectable', 'hasBorders', 'evented'])
    this.app.saveState.next(JSON.stringify(state))
  }

}
