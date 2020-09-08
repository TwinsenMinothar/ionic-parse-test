import { Component, OnInit, Input } from "@angular/core";
import { TaskService } from "src/app/services/task.service";
import { Task } from "src/app/Models/task.model";
import { ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-task-save",
  templateUrl: "./task-save.page.html",
  styleUrls: ["./task-save.page.scss"],
})
export class TaskSavePage implements OnInit {
  task: any;
  taskForm: FormGroup;
  constructor(
    private taskService: TaskService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.createForm();
    this.init();
  }

  private createForm() {
    this.taskForm = this.formBuilder.group({
      title: ["", [Validators.required]],
    });
  }

  private init() {
    const id = this.route.snapshot.paramMap.get("taskid");
    console.log("From task save page id:", id);
    this.task = this.taskService.getTask(id);
    console.log(this.task);
    if (this.task) {
      this.taskForm.get("title").setValue(this.task.get("title"));
    }
  }
  onSubmit() {
    const newTitle = this.taskForm.get("title").value;
    this.taskService.updateTask(this.task, newTitle);
    this.navCtrl.navigateBack("user/tasks");
  }

  async onDelete() {
    this.taskService
      .deleteTask(this.task)
      .then((res) => this.navCtrl.navigateBack("user/tasks"));
  }
}
