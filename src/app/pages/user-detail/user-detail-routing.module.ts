import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserDetailPage } from './user-detail.page';

const routes: Routes = [
  {
    path: '',
    component: UserDetailPage
  },
  {
    path: ":taskid",
    loadChildren: () =>
      import("../task-save/task-save.module").then(
        (m) => m.TaskSavePageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDetailPageRoutingModule {}
