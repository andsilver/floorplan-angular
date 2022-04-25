import { Component, OnInit, AfterViewInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { fabric } from 'fabric';
import { saveAs } from 'file-saver';

import { AppService } from '../../app.service';
import * as _ from '../../helpers';

const {
  RL_VIEW_WIDTH,
  RL_VIEW_HEIGHT,
  RL_FOOT,
  RL_AISLEGAP,
  RL_ROOM_OUTER_SPACING,
  RL_ROOM_INNER_SPACING,
  RL_ROOM_STROKE,
  RL_CORNER_FILL,
  RL_UNGROUPABLES,
  RL_CREDIT_TEXT,
  RL_CREDIT_TEXT_PARAMS
} = _;

const { Line, Point } = fabric;
const
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  OFFSET = RL_ROOM_INNER_SPACING / 2;

const Left = (wall) => wall.x1 < wall.x2 ? wall.x1 : wall.x2;
const Top = (wall) => wall.y1 < wall.y2 ? wall.y1 : wall.y2;
const Right = (wall) => wall.x1 > wall.x2 ? wall.x1 : wall.x2;
const Bottom = (wall) => wall.y1 > wall.y2 ? wall.y1 : wall.y2;


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
  room: fabric.Group;
  roomLayer: fabric.Group | fabric.Rect;
  corners = [];
  walls: fabric.Line[] = [];
  lastObjectDefinition = null;
  lastObject = null;

  CTRL_KEY_DOWN = false;
  MOVE_WALL_ID = -1;
  ROOM_SIZE = { width: 960, height: 480 };
  DEFAULT_CHAIR = null;
  REMOVE_DW = false;

  constructor(public app: AppService) { }



  ngOnInit() {
    this.app.roomEdition.subscribe(doEdit => {
      this.corners.forEach(c => this.setCornerStyle(c));
      this.drawRoom();
      if (doEdit) { this.editRoom(); } else { this.cancelRoomEdition(); }
    });

    this.app.insertObject.subscribe(res => {
      this.handleObjectInsertion(res);
      this.saveState();
    });

    this.app.defaultChair.subscribe(res => this.DEFAULT_CHAIR = res);

    this.app.performOperation.subscribe(operation => {
      switch (operation) {

        case 'UNDO':
          this.undo();
          break;

        case 'REDO':
          this.redo();
          break;

        case 'COPY':
          this.copy();
          break;

        case 'PASTE':
          this.paste();
          break;

        case 'DELETE':
          this.delete();
          break;

        case 'ROTATE':
          this.rotate();
          break;

        case 'ROTATE_ANTI':
          this.rotate(false);
          break;

        case 'GROUP':
          this.group();
          break;

        case 'UNGROUP':
          this.ungroup();
          break;

        case 'HORIZONTAL':
        case 'VERTICAL':
          this.placeInCenter(operation);
          break;

        case 'ROOM_OPERATION':
          this.drawRoom();
          break;

        case 'PNG':
        case 'SVG':
          this.saveAs(operation);
          break;

        case 'ZOOM':
          this.setZoom();
          break;

        case 'LEFT':
        case 'CENTER':
        case 'RIGHT':
        case 'TOP':
        case 'MIDDLE':
        case 'BOTTOM':
          this.arrange(operation);
          break;
      }
    });
  }



  ngAfterViewInit() {
    /** Initialize canvas */
    this.setCanvasView();
    /** Add room */
    this.setRoom(this.ROOM_SIZE);
    this.saveState();
  }



  get room_origin() {
    return RL_ROOM_OUTER_SPACING + RL_ROOM_INNER_SPACING;
  }



  onKeyDown(event: KeyboardEvent) {
    const code = event.key || event.keyCode;
    // Ctrl Key is down
    if (event.ctrlKey) {
      this.CTRL_KEY_DOWN = true;
      // Ctrl + Shift + Z
      if (event.shiftKey && code === 90)
        this.app.redo();
      else if (code === 90)
        this.app.undo();
      else if (code === 67)
        this.app.copy();
      else if (code === 86)
        this.paste();
      else if (code === 37)
        this.rotate();
      else if (code === 39)
        this.rotate(false);
      else if (code === 71)
        this.group();
    }
    else if (code === 46)
      this.delete();
    else if (code === 37)
      this.move('LEFT');
    else if (code === 38)
      this.move('UP');
    else if (code === 39)
      this.move('RIGHT');
    else if (code === 40)
      this.move('DOWN');
  }



  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.CTRL_KEY_DOWN = false;
    }
  }


  onScroll(event) { }


  setGroupableState() {
    if (this.app.selections.length > 1) {
      this.app.ungroupable = false;
      return;
    }

    const obj = this.view.getActiveObject();
    const type = obj.name ? obj.name.split(':')[0] : '';

    if (RL_UNGROUPABLES.indexOf(type) > -1) {
      this.app.ungroupable = false;
    } else {
      this.app.ungroupable = true;
    }
  }


  onSelected() {
    const active = this.view.getActiveObject();
    active.lockScalingX = true, active.lockScalingY = true;
    if (!active.name) {
      active.name = 'GROUP';
    }
    this.app.selections = this.view.getActiveObjects();
    this.setGroupableState();
  }


  /**********************************************************************************************************
   * init the canvas view & bind events
   * -------------------------------------------------------------------------------------------------------
   */
  setCanvasView() {
    const canvas = new fabric.Canvas('main');
    canvas.setWidth(RL_VIEW_WIDTH * RL_FOOT);
    canvas.setHeight(RL_VIEW_HEIGHT * RL_FOOT);
    this.view = canvas;

    const cornersOfWall = (obj: fabric.Line) => {
      const id = Number(obj.name.split(':')[1]);
      const v1Id = id;
      const v1 = this.corners[v1Id];
      const v2Id = (id + 1) % this.walls.length;
      const v2 = this.corners[v2Id];
      return { v1, v1Id, v2, v2Id };
    };

    this.view.on('selection:created', (e: fabric.IEvent) => {
      if (this.app.roomEdit) {
        return;
      }
      this.onSelected();
    });

    this.view.on('selection:updated', (e: fabric.IEvent) => {
      if (this.app.roomEdit) {
        return;
      }
      this.onSelected();
    });

    this.view.on('selection:cleared', (e: fabric.IEvent) => {
      if (this.app.roomEdit) {
        return;
      }
      this.app.selections = [];
      this.app.ungroupable = false;
    });

    this.view.on('object:moved', () => {
      if (this.MOVE_WALL_ID !== -1) {
        this.MOVE_WALL_ID = -1;
      }
      this.saveState();
    });

    this.view.on('object:rotated', () => this.saveState());

    this.view.on('mouse:down:before', (e: fabric.IEvent) => {
      const obj = e.target;

      if (this.app.roomEdit && obj && obj.name.indexOf('WALL') > -1 && obj instanceof Line) {
        let { v1, v2, v1Id, v2Id } = cornersOfWall(obj);
        const v0Id = (v1Id === 0) ? this.corners.length - 1 : v1Id - 1;
        const v3Id = (v2Id === this.corners.length - 1) ? 0 : v2Id + 1;
        const v0 = this.corners[v0Id];
        const v3 = this.corners[v3Id];

        this.MOVE_WALL_ID = v1Id;

        if ((v0.top === v1.top && v1.top === v2.top) || (v0.left === v1.left && v1.left === v2.left)) {
          this.corners.splice(v1Id, 0, this.drawCorner(new Point(v1.left, v1.top)));
          this.MOVE_WALL_ID = v1Id + 1;
          v2Id += 1;
        }

        if ((v1.top === v2.top && v2.top === v3.top) || (v1.left === v2.left && v2.left === v3.left)) {
          this.corners.splice(v2Id + 1, 0, this.drawCorner(new Point(v2.left, v2.top)));
        }

        this.drawRoom();
        this.saveState();
      }
    });

    this.view.on('object:moving', (e: fabric.IEvent) => {
      if (this.MOVE_WALL_ID !== -1) {
        const p = e['pointer'];
        const v1 = this.corners[this.MOVE_WALL_ID];
        const v2 = this.corners[(this.MOVE_WALL_ID + 1) % this.corners.length];
        const direction = v1.left === v2.left ? 'HORIZONTAL' : 'VERTICAL';

        if (p.y < RL_ROOM_OUTER_SPACING) { p.y = RL_ROOM_OUTER_SPACING; }
        if (p.x < RL_ROOM_OUTER_SPACING) { p.x = RL_ROOM_OUTER_SPACING; }

        if (direction === 'VERTICAL') {
          v1.top = v2.top = p.y;
        } else {
          v1.left = v2.left = p.x;
        }

        this.drawRoom();
      }

      const obj = e.target;
      const point = e['pointer'];

      if (obj && this.isDW(obj) && obj instanceof fabric.Group) {
        let wall, distance = 999;
        const dist2 = (v, w) => (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
        const point_to_line = (p, v, w) => Math.sqrt(distToSegmentSquared(p, v, w));
        const distToSegmentSquared = (p, v, w) => {
          const l2 = dist2(v, w);

          if (l2 == 0)
            return dist2(p, v);

          const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

          if (t < 0)
            return dist2(p, v);

          if (t > 1)
            return dist2(p, w);

          return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
        };

        this.walls.forEach(w => {
          const d = point_to_line(point, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
          if (d < distance) {
            distance = d, wall = w;
          }
        });

        if (distance > 20) {
          this.REMOVE_DW = true;
        } else {
          this.REMOVE_DW = false;
          const direction = this.directionOfWall(wall);

          if (direction === HORIZONTAL) {
            this.locateDW(obj, wall, point.x, Top(wall));
          } else {
            this.locateDW(obj, wall, Left(wall), point.y);
          }
        }
      }
    });

    this.view.on('mouse:up', (e: fabric.IEvent) => {
      const obj = e.target;

      if (this.REMOVE_DW) {
        this.view.remove(obj);
        this.REMOVE_DW = false;
      }
    });

    this.view.on('mouse:dblclick', (e: fabric.IEvent) => {
      const obj = e.target;

      if (this.app.roomEdit && this.app.roomEditOperate === 'CORNER' && obj && obj.name.indexOf('WALL') > -1 && obj instanceof Line) {
        const p = e['pointer'];
        const { v1, v1Id, v2, v2Id } = cornersOfWall(obj);
        const ind = v1Id < v2Id ? v1Id : v2Id;

        if (v1.left === v2.left) {
          p.x = v1.left;
        } else if (v1.top === v2.top) {
          p.y = v1.top;
        }

        const newCorner = this.drawCorner(new Point(p.x, p.y));

        if (Math.abs(v1Id - v2Id) != 1) {
          this.corners.push(newCorner);
        } else {
          this.corners.splice(ind + 1, 0, newCorner);
        }

        this.drawRoom();
        this.saveState();
      }
    });
  }




  /**********************************************************************************************************
   * draw Rooms defined in Model
   * -------------------------------------------------------------------------------------------------------
   */
  setRoom({ width, height }) {
    if (this.walls.length) {
      this.view.remove(...this.walls);
      this.view.renderAll();
    }

    const LT = new Point(RL_ROOM_OUTER_SPACING, RL_ROOM_OUTER_SPACING);
    const RT = new Point(LT.x + width, LT.y);
    const LB = new Point(LT.x, LT.y + height);
    const RB = new Point(RT.x, LB.y);

    this.corners = [LT, RT, RB, LB].map(p => this.drawCorner(p));
    this.drawRoom();
  }


  /**********************************************************************************************************
   * set corner according to current edition status
   * -------------------------------------------------------------------------------------------------------
   */
  setCornerStyle(c: fabric.Rect) {
    c.moveCursor = this.view.freeDrawingCursor;
    c.hoverCursor = this.view.freeDrawingCursor;
    c.selectable = false;
    c.evented = false;
    c.width = c.height = (RL_ROOM_INNER_SPACING / (this.app.roomEdit ? 1.5 : 2)) * 2;
    c.set('fill', this.app.roomEdit ? RL_CORNER_FILL : RL_ROOM_STROKE);
  }



  /**********************************************************************************************************
   * draw corner
   * -------------------------------------------------------------------------------------------------------
   */
  drawCorner(p: fabric.Point) {
    const c = new fabric.Rect({
      left: p.x,
      top: p.y,
      strokeWidth: 0,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      name: 'CORNER'
    });
    this.setCornerStyle(c);
    return c;
  }


  /**********************************************************************************************************
   * draw room
   * -------------------------------------------------------------------------------------------------------
   */
  drawRoom() {

    const exists = this.view.getObjects().filter(obj => obj.name.indexOf('WALL') > -1 || obj.name === 'CORNER');
    this.view.remove(...exists);

    this.view.add(...this.corners);

    const wall = (coords: number[], index: number) => new Line(coords, {
      stroke: RL_ROOM_STROKE,
      strokeWidth: RL_ROOM_INNER_SPACING,
      name: `WALL:${index}`,
      originX: 'center',
      originY: 'center',
      hoverCursor: this.app.roomEdit ? this.view.moveCursor : this.view.defaultCursor,
      hasControls: false,
      hasBorders: false,
      selectable: this.app.roomEdit,
      evented: this.app.roomEdit,
      cornerStyle: 'rect'
    });

    let LT = new Point(9999, 9999), RB = new Point(0, 0);

    this.walls = this.corners.map((corner, i) => {
      const start = corner;
      const end = (i === this.corners.length - 1) ? this.corners[0] : this.corners[i + 1];

      if (corner.top < LT.x && corner.left < LT.y)
        LT = new Point(corner.left, corner.top);

      if (corner.top > RB.y && corner.left > RB.y)
        RB = new Point(corner.left, corner.top);

      const w = wall([start.left, start.top, end.left, end.top], i);
      return w;
    });

    this.view.add(...this.walls);
    this.walls.forEach(w => w.sendToBack());
    this.ROOM_SIZE = { width: RB.x - LT.x, height: RB.y - LT.y };
  }


  locateDW(dw: fabric.Group, wall: fabric.Line, x: number, y: number) {
    const dWall = this.directionOfWall(wall);
    const dDW = dw.angle % 180 === 0 ? HORIZONTAL : VERTICAL;

    if (dWall != dDW) {
      dw.angle = (dw.angle + 90) % 360;
    }

    dw.top = y, dw.left = x;
    const center = dw.getCenterPoint();

    if (dWall === HORIZONTAL)
      center.y < dw.top ? dw.top += OFFSET : dw.top -= OFFSET;
    else
      center.x < dw.left ? dw.left += OFFSET : dw.left -= OFFSET;

    return dw;
  }

  setDWOrigin(dw: fabric.Group) {
    if (!dw.flipX && !dw.flipY)
      dw.originX = 'left', dw.originY = 'top';
    else if (dw.flipX && !dw.flipY)
      dw.originX = 'right', dw.originY = 'top';
    else if (!dw.flipX && dw.flipY)
      dw.originX = 'left', dw.originY = 'bottom';
    else if (dw.flipX && dw.flipY)
      dw.originX = 'right', dw.originY = 'bottom';
    return dw;
  }



  /**********************************************************************************************************/

  editRoom() {
    this.view.getObjects().forEach(r => {
      if (r.name.indexOf('WALL') !== -1) {
        r.selectable = true;
        r.evented = true;
      } else {
        r.selectable = false;
        r.evented = false;
      }
    });

    if (this.app.roomEditStates.length === 0)
      this.saveState();
  }

  cancelRoomEdition() {
    this.view.getObjects().forEach(r => {
      if (r.name.indexOf('WALL') !== -1 || r.name.indexOf('CORNER') !== -1) {
        r.selectable = false;
        r.evented = false;
      } else {
        r.selectable = true;
        r.evented = true;
      }
    });
  }

  handleObjectInsertion({ type, object }) {

    if (type === 'ROOM') {
      this.setRoom(object);
      return;
    }

    const group = _.createFurniture(type, object, this.DEFAULT_CHAIR);

    if (type === 'DOOR' || type === 'WINDOW') {
      group.originX = 'center';
      group.originY = 'top';


      const dws = this.filterObjects(['DOOR', 'WINDOW']);
      const dw = dws.length ? dws[dws.length - 1] : null;

      let wall, x, y;
      if (!dw) {
        wall = this.walls[0];
        x = Left(wall) + RL_AISLEGAP;
        y = Top(wall);
      } else {
        const od = dw.angle % 180 === 0 ? HORIZONTAL : VERTICAL;

        let placeOnNextWall = false;
        wall = this.wallOfDW(dw);

        if (od === HORIZONTAL) {
          x = dw.left + dw.width + RL_AISLEGAP;
          y = Top(wall);
          if (x + group.width > Right(wall)) {
            placeOnNextWall = true;
          }
        } else {
          y = dw.top + dw.width + RL_AISLEGAP;
          x = Left(wall);
          if (y + group.width > Bottom(wall)) {
            placeOnNextWall = true;
          }
        }

        if (placeOnNextWall) {
          wall = this.walls[(Number(wall.name.split(':')[1]) + 1) % this.walls.length];
          const nd = this.directionOfWall(wall);

          if (nd === HORIZONTAL) {
            x = Left(wall) + RL_AISLEGAP, y = Top(wall);
          } else {
            x = Left(wall), y = Top(wall) + RL_AISLEGAP;
          }
        }
      }

      this.locateDW(group, wall, x, y);

      group.hasBorders = false;
      this.view.add(group);

      return;
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
      const lastWidth = this.lastObjectDefinition.width || 100;
      const lastHeight = this.lastObjectDefinition.height || 40;

      let newLeft = this.lastObject.left + lastWidth + useLR;
      let newTop = this.lastObject.top;

      // make sure we fit left to right, including our required right spacing
      if (newLeft + group.width + newLR > this.ROOM_SIZE.width) {
        newLeft = newLR + (group.width / 2);
        newTop += lastHeight + useTB;
      }

      group.left = newLeft;
      group.top = newTop;

      if ((group.left - group.width / 2) < this.room_origin) { group.left += this.room_origin; }
      if ((group.top - group.height / 2) < this.room_origin) { group.top += this.room_origin; }
    }

    this.view.add(group);
    this.view.setActiveObject(group);

    this.lastObject = group;
    this.lastObjectDefinition = object;
  }


  /** Save current state */
  saveState() {
    const state = this.view.toDatalessJSON(['name', 'hasControls', 'selectable', 'hasBorders', 'evented', 'hoverCursor', 'moveCursor']);
    this.app.saveState.next(JSON.stringify(state));
  }


  undo() {
    let current = null;

    if (this.app.roomEdit) {
      const state = this.app.roomEditStates.pop();
      this.app.roomEditRedoStates.push(state);
      current = this.app.roomEditStates[this.app.roomEditStates.length - 1];
    } else {
      const state = this.app.states.pop();
      this.app.redoStates.push(state);
      current = this.app.states[this.app.states.length - 1];
    }

    this.view.clear();
    this.view.loadFromJSON(current, () => {
      this.view.renderAll();
      this.corners = this.view.getObjects().filter(obj => obj.name === 'CORNER');
      this.drawRoom();
    });
  }


  /** Redo operation */
  redo() {
    let current = null;

    if (this.app.roomEdit) {
      current = this.app.roomEditRedoStates.pop();
      this.app.roomEditStates.push(current);
    } else {
      current = this.app.redoStates.pop();
      this.app.states.push(current);
    }

    this.view.clear();
    this.view.loadFromJSON(current, () => {
      this.view.renderAll();
      this.corners = this.view.getObjects().filter(obj => obj.name === 'CORNER');
      this.drawRoom();
    });
  }


  /** Copy operation */
  copy() {
    if (this.app.roomEdit) {
      return;
    }
    const active = this.view.getActiveObject();
    if (!active) {
      return;
    }
    active.clone(cloned => this.app.copied = cloned, ['name', 'hasControls']);
  }

  /** Paste operation */
  paste() {
    if (!this.app.copied || this.app.roomEdit) {
      return;
    }
    this.app.copied.clone((cloned) => {
      this.view.discardActiveObject();
      cloned.set({
        left: cloned.left + RL_AISLEGAP,
        top: cloned.top + RL_AISLEGAP
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = this.view;
        cloned.forEachObject(obj => this.view.add(obj));
        cloned.setCoords();
      } else {
        this.view.add(cloned);
      }
      this.app.copied.top += RL_AISLEGAP;
      this.app.copied.left += RL_AISLEGAP;
      this.view.setActiveObject(cloned);
      this.view.requestRenderAll();
      this.saveState();
    }, ['name', 'hasControls']);
  }

  /** Delete operation */
  delete() {
    if (this.app.roomEdit) {
      return;
    }
    this.app.selections.forEach(selection => this.view.remove(selection));
    this.view.discardActiveObject();
    this.view.requestRenderAll();
    this.saveState();
  }

  /** Rotate Operation */
  rotate(clockwise = true) {
    if (this.app.roomEdit) {
      return;
    }

    let angle = this.CTRL_KEY_DOWN ? 90 : 15;
    const obj = this.view.getActiveObject();

    if (!obj) { return; }

    if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
      obj.originX = 'center';
      obj.originY = 'center';
      obj.left += obj.width / 2;
      obj.top += obj.height / 2;
    }

    if (this.isDW(obj)) {
      angle = obj.angle + (clockwise ? 180 : -180);
    } else {
      angle = obj.angle + (clockwise ? angle : -angle);
    }

    if (angle > 360) { angle -= 360; } else if (angle < 0) { angle += 360; }

    obj.angle = angle;
    this.view.requestRenderAll();
  }

  /** Group */
  group() {
    if (this.app.roomEdit) {
      return;
    }

    const active = this.view.getActiveObject();
    if (!(this.app.selections.length > 1 && active instanceof fabric.ActiveSelection)) {
      return;
    }

    active.toGroup();
    active.lockScalingX = true, active.lockScalingY = true;
    this.onSelected();
    this.view.renderAll();
    this.saveState();
  }

  ungroup() {
    if (this.app.roomEdit) {
      return;
    }

    const active = this.view.getActiveObject();
    if (!(active && active instanceof fabric.Group)) {
      return;
    }

    active.toActiveSelection();
    active.lockScalingX = true, active.lockScalingY = true;
    this.onSelected();
    this.view.renderAll();
    this.saveState();
  }

  move(direction, increament = 6) {
    if (this.app.roomEdit) {
      return;
    }

    const active = this.view.getActiveObject();
    if (!active) {
      return;
    }
    switch (direction) {
      case 'LEFT':
        active.left -= increament;
        break;
      case 'UP':
        active.top -= increament;
        break;
      case 'RIGHT':
        active.left += increament;
        break;
      case 'DOWN':
        active.top += increament;
        break;
    }
    this.view.requestRenderAll();
    this.saveState();
  }

  setZoom() {
    this.view.setZoom(this.app.zoom / 100);
    this.view.renderAll();
  }

  placeInCenter(direction) {
    const active = this.view.getActiveObject();

    if (!active) {
      return;
    }

    if (direction === 'HORIZONTAL') {
      active.left = this.ROOM_SIZE.width / 2 - (active.originX === 'center' ? 0 : active.width / 2);
    } else {
      active.top = this.ROOM_SIZE.height / 2 - (active.originX === 'center' ? 0 : active.height / 2);
    }

    active.setCoords();
    this.view.requestRenderAll();
    this.saveState();
  }

  arrange(action: string) {
    const rect = this.getBoundingRect(this.app.selections);
    action = action.toLowerCase();
    this.app.selections.forEach(s => {
      if (action === 'left' || action === 'right' || action === 'center') {
        s.left = rect[action];
      } else {
        s.top = rect[action];
      }
    });
    this.view.renderAll();
    this.saveState();
  }

  filterObjects(names: string[]) {
    return this.view.getObjects().filter(obj => names.some(n => obj.name.indexOf(n) > -1));
  }


  wallOfDW(dw: fabric.Group | fabric.Object) {
    const d = dw.angle % 180 === 0 ? HORIZONTAL : VERTICAL;
    return this.walls.find(w => Math.abs(d === HORIZONTAL ? w.top - dw.top : w.left - dw.left) === OFFSET);
  }

  directionOfWall(wall: fabric.Line) {
    if (wall.x1 === wall.x2) {
      return VERTICAL;
    } else {
      return HORIZONTAL;
    }
  }

  isDW(object) {
    return object.name.indexOf('DOOR') > -1 || object.name.indexOf('WINDOW') > -1;
  }

  getBoundingRect(objects: any[]) {
    let top = 9999, left = 9999, right = 0, bottom = 0;
    objects.forEach(obj => {
      if (obj.left < top) {
        top = obj.top;
      }
      if (obj.left < left) {
        left = obj.left;
      }
      if (obj.top > bottom) {
        bottom = obj.top;
      }
      if (obj.left > right) {
        right = obj.left;
      }
    });

    const center = (left + right) / 2;
    const middle = (top + bottom) / 2;

    return { left, top, right, bottom, center, middle };
  }

  saveAs(format: string) {

    const { right, bottom } = this.getBoundingRect(this.corners);
    const width = this.view.getWidth();
    const height = this.view.getHeight();

    this.view.setWidth(right + RL_ROOM_OUTER_SPACING);
    this.view.setHeight(bottom + RL_ROOM_OUTER_SPACING + 12);
    this.view.setBackgroundColor('white', () => { });

    const credit = new fabric.Text(RL_CREDIT_TEXT,
      {
        ...RL_CREDIT_TEXT_PARAMS,
        left: RL_ROOM_OUTER_SPACING,
        top: bottom + RL_ROOM_OUTER_SPACING - RL_CREDIT_TEXT_PARAMS.fontSize
      }
    );
    this.view.add(credit);
    this.view.discardActiveObject();
    this.view.renderAll();

    const restore = () => {
      this.view.remove(credit);
      this.view.setBackgroundColor('transparent', () => { });
      this.view.setWidth(width);
      this.view.setHeight(height);
      this.view.renderAll();
    };

    if (format === 'PNG') {
      const canvas: any = document.getElementById('main');
      canvas.toBlob((blob: Blob) => {
        saveAs(blob, `room_layout_${formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en')}.png`);
        restore();
      });
    } else if (format === 'SVG') {
      const svg = this.view.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      saveAs(blob, `room_layout_${formatDate(new Date(), 'yyyy-MM-dd-hh-mm-ss', 'en')}.svg`);
      restore();
    }
  }

}
