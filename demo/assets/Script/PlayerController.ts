import { _decorator, Animation, Component, EventMouse, Input, input, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property(Animation)
  BodyAni: Animation = null;
  private startJump = false;
  private speed = 0;
  private jumpTime = 0.3; //移动时间0.1s
  private costTime = 0;
  private targetPos = new Vec3(0, 0, 0);
  private _curStep = 0;
  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }
  setInputActive(active: boolean) {
    console.log("setInputActive", active);
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  update(deltaTime: number) {
    if (!this.startJump) {
      return;
    }
    this.costTime += deltaTime;
    if (this.costTime >= this.jumpTime) {
      this.node.setPosition(this.targetPos);
      this.startJump = false;
      this.costTime = 0;
      this.node.emit("onJumpEnd", this._curStep);
    } else {
      let movePos = this.node.getPosition();
      this.node.setPosition(movePos.add(new Vec3(deltaTime * this.speed, 0, 0)));
    }
  }
  onMouseUp(event: EventMouse) {
    if (event.getButton() == 0) {
      console.log("jump 1");
      this.jump(1);
    } else if (event.getButton() == 2) {
      console.log("jump 2");
      this.jump(2);
    }
  }
  jump(step: number) {
    console.log(1111, this.BodyAni);
    if (this.startJump) {
      return;
    }
    this.startJump = true;
    this.speed = (step * 40) / this.jumpTime;
    let curPos = this.node.getPosition();
    this.targetPos = curPos.add(new Vec3(step * 40, 0, 0));
    if (this.BodyAni) {
      if (step === 1) {
        this.BodyAni.play("jumpOne");
      } else {
        this.BodyAni.play("jumpTwo");
      }
    }
    this._curStep += step;
  }
}
