import { ECRResource } from "../../state/resource/resource";
import { UserAction } from "../../../display/display.api";
import { UserId } from "../../../network/adapter/adapter.api";

export class UserActionResource<
  T extends UserAction = UserAction
> extends ECRResource {
  constructor(readonly actions: Record<UserId, UserAction[]>) {
    super();
  }
}
