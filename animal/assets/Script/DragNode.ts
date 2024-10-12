import { _decorator, Component, EventTouch, NodeEventType, Vec2, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DragNode")
export class DragNode extends Component {
  private isDragging = false;
  public dragable = false;
  private startTouchPosition: Vec2 = new Vec2();
  private startNodePosition: Vec2 = new Vec2();

  onLoad() {
    console.log(this.node.getPosition());
    this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
  }

  onTouchStart(touch: EventTouch) {
    const location = touch.getLocation();
    console.log("onTouchStart", location.x, location.y);
  }

  onTouchMove(touch: EventTouch) {
    const { x, y } = touch.getUIDelta();
    const newPos = this.node.position;
    this.node.setPosition(new Vec3(newPos.x + x, newPos.y + y, newPos.z));
  }

  onTouchEnd(touch: EventTouch) {
    const location = touch.getLocation();
    console.log("onTouchEnd", location.x, location.y);
    this.isDragging = false;
  }
}
