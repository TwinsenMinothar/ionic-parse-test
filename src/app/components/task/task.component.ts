import { Component, Input, EventEmitter, Output } from "@angular/core";
import { Task } from "src/app/Models/task.model";
import { NavController } from '@ionic/angular';

@Component({
  selector: "app-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
})
export class TaskComponent {
  @Input() task: any;
  @Output() update = new EventEmitter<any>();
  @Output() done = new EventEmitter<any>();

  constructor(private navCtrl: NavController){}

}

