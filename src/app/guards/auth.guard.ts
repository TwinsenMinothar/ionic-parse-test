import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivateChild,
  CanLoad,
  Router,
  Route,
  UrlSegment,
} from "@angular/router";
import { Observable } from "rxjs";
import { ParseService } from "../services/parse.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private parse: ParseService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkAuthState(state.url);
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.canActivate(next, state);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url = segments.map((s) => `/${s}`).join("");
    return this.checkAuthState(url);
  }

  private checkAuthState(redirect: string): boolean {
    const user = this.parse.currentUser;
    if (user === null) {
      this.router.navigate(["/login"], {
        queryParams: { redirect },
      });
      console.log("From check AuthState in guard returning false");
      return false;
    }
    console.log("From check AuthState in guard returning true");
    return true;
  }
}
