import { NgModule } from "@angular/core";
import { UserDetailPageRoutingModule } from "./user-detail-routing.module";

import { UserDetailPage } from "./user-detail.page";
import { SharedModule } from "src/app/shared/shared.module";
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [ComponentsModule,SharedModule, UserDetailPageRoutingModule],
  declarations: [UserDetailPage],
})
export class UserDetailPageModule {}
