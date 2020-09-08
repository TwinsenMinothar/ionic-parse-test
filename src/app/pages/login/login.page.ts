import { Component, OnInit } from "@angular/core";
import { ParseService } from "src/app/services/parse.service";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  authForm: FormGroup;
  creatingAccount: boolean = false;
  loginButtonText: String = "Login";
  createAccButtonText: String = "Create Account";

  constructor(
    private parse: ParseService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {
    this.createForm();
  }

  ngOnInit() {
    const user = this.parse.currentUser;
    console.log("User: ", user);
    if (user !== null) this.navCtrl.navigateForward(`/user/tasks`);
  }

  private nameControl = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);

  private createForm() {
    this.authForm = this.formBuilder.group({
      email: ["", [Validators.email, Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  changeAuthAction() {
    this.creatingAccount = !this.creatingAccount;
    if (this.creatingAccount) {
      this.authForm.addControl("name", this.nameControl);
      this.loginButtonText = "Create account";
      this.createAccButtonText = "I already have an account";
    } else {
      this.authForm.removeControl("name");
      this.loginButtonText = "Login";
      this.createAccButtonText = "Create account";
    }
  }

  private async login() {
    try {
      const credentials = await this.parse.logIn(
        this.authForm.get("email").value,
        this.authForm.get("password").value
      );
      console.log("Authenticated: ", credentials);
      this.navCtrl.navigateForward(`/user/tasks`);
    } catch (e) {
      console.log("Error: ", e);
    }
  }
  private async signUp() {
    try {
      const credentials = await this.parse.signUp({
        username: this.authForm.get("name").value.trim(),
        name: this.authForm.get("name").value,
        email: this.authForm.get("email").value,
        password: this.authForm.get("password").value,
      });
      console.log("Account created: ", credentials);
      this.navCtrl.navigateForward(`/user/tasks`);
    } catch (e) {
      console.log("Error: ", e);
    }
  }

  onSubmit() {
    this.creatingAccount ? this.signUp() : this.login();
  }
}
