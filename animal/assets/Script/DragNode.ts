import {
  _decorator,
  Component,
  EventTouch,
  NodeEventType,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("DragNode")
export class DragNode extends Component {
  private isDragging = false;
  private startTouchPosition: Vec2 = new Vec2();
  private startNodePosition: Vec2 = new Vec2();

  onLoad() {
    console.log("DragNode.onLoad");

    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
  }

  onTouchStart(touch: EventTouch) {
    debugger;
    const location = touch.getLocation();
    const nodePosition = this.node.getPosition();
    const posV2 = new Vec2(nodePosition.x, nodePosition.y);
    const distance = location.subtract(posV2).length();
    if (distance > 50) {
      this.isDragging = true;
      this.startTouchPosition = location.clone();
      this.startNodePosition = posV2.clone();
    }
  }

  onTouchMove(touch: EventTouch) {
    if (this.isDragging) {
      const location = touch.getLocation();
      const offset = location.subtract(this.startTouchPosition);
      const v2 = this.startNodePosition.add(offset);
      this.node.setPosition(new Vec3(v2.x, v2.y, 0));
    }
  }

  onTouchEnd(touch: EventTouch) {
    this.isDragging = false;
  }
}
