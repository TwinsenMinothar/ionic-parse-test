import { Injectable } from "@angular/core";
import { ParseService } from "./parse.service";
import { Task } from "../Models/task.model";
import { Observable, from, EMPTY } from "rxjs";
import { Parse } from "parse";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  tasks: any[];
  constructor(private parse: ParseService) {}

  get allTasks(): any {
    return this.tasks;
  }

  async saveTask(task: Task): Promise<any> {
    const user = this.parse.currentUser;
    if (user !== null) {
      this.parse
        .saveItem("Task", task)
        .then((obj) => {
          this.tasks.push(obj);
          this.parse
            .putRelation(user, "tasks", obj)
            .then((rel) => {
              console.log(rel);
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    } else {
    }
  }

  async subscribeToTasks(): Promise<any> {
    const sub = await this.parse.subscribeQuery(`Task`);
    return sub;
  }

  async getAllTasks() {
    const user = this.parse.currentUser;
    if (user !== null) {
      this.tasks = await this.parse.getRelation(user, "tasks");
      return this.tasks;
    }
  }

  getTask(id: string) {
    for (const task of this.tasks) {
      if (task.id === id) return task;
    }
  }

  async updateTask(task: any, newTitle: string) {
    this.parse
      .updateItem(task, { title: newTitle })
      .then((obj) => console.log("Update Task: ", obj));
  }

  async changeTaskSate(task: any, state: boolean) {
    this.parse
      .updateItem(task, { done: state })
      .then((obj) => console.log(obj.get("done")))
      .catch((e) => console.log(e));
  }

  async deleteTask(task: any) {
    const newArray: any[] = [];
    for (const t of this.tasks) {
      if (t.id !== task.id) newArray.push(t);
    }
    this.tasks = newArray;
    this.parse
      .deleteItem(task)
      .then((obj) => {
        console.log("Deleted", obj);
      })
      .catch((e) => console.log(e));
  }
}
