import { Component, OnInit } from "@angular/core";
import { ParseService } from "src/app/services/parse.service";
import { Router } from "@angular/router";
import { Task } from "src/app/Models/task.model";
import { TaskService } from "src/app/services/task.service";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-user-detail",
  templateUrl: "./user-detail.page.html",
  styleUrls: ["./user-detail.page.scss"],
})
export class UserDetailPage implements OnInit {
  user: any = null;
  tasks: any[] = [];
  constructor(
    private parse: ParseService,
    private router: Router,
    private taskService: TaskService,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.user = this.parse.currentUser;
    this.taskService
      .getAllTasks()
      .then((obj) => {
        this.tasks = obj;
      })
      .catch((e) => console.log(e));
    const sub = await this.taskService.subscribeToTasks();
    sub.on("create", (obj, res) => {
      console.log("Create: ", this.tasks);
    });
    sub.on("delete", (obj, res) => {
      this.tasks = this.taskService.tasks;
      console.log("delete: ", obj);
    });
    sub.on("enter", (obj) => {
      console.log("enter: ", obj);
    });
    sub.on("update", (obj, ori, res) => {
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i].id === obj.id) this.tasks[i] = obj;
      }
      console.log("update: ", obj);
    });
  }

  addTask() {
    this.taskService
      .saveTask({
        title: "New Task",
        done: false,
      })
      .then(() => (this.tasks = this.taskService.tasks));
  }

  async logOut() {
    await this.parse.logOut();
    this.router.navigate(["/login"]);
  }

  onEdit(task: any) {
    console.log("From user detail onClick: ", task);
    console.log(`navigating to /user/tasks/${task.id}`);
    this.navCtrl.navigateForward(`/user/tasks/${task.id}`);
  }

  onDone(task: any) {
    const isDone = task.get("done");
    this.taskService.changeTaskSate(task, !isDone);
  }
}
