import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { TaskComponent } from "./task/task.component";

@NgModule({
  declarations: [TaskComponent],
  imports: [SharedModule],
  exports: [TaskComponent],
})
export class ComponentsModule {}
