import { Store } from '@ngrx/store';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { BreakpointObserver} from '@angular/cdk/layout'
import { MatSidenav } from '@angular/material/sidenav';
import { IAppState } from 'src/context/app.state';
import * as Actions from 'src/context/actions';
import {Router} from "@angular/router"
import Swal from 'sweetalert2';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
})
export class DefaultComponent implements AfterViewInit {
  @ViewChild(MatSidenav) sidenav! : MatSidenav;
 

  constructor(private observer : BreakpointObserver, private store: Store<IAppState>, private router: Router) { }


  HandelLogout(): void {
    Swal.fire({
      title: 'Logout',
      text: 'do You want to logout',
      icon: 'warning',
      confirmButtonText: 'Ok',
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        this.store.dispatch(Actions.Logout());
        this.router.navigate(['/login']);
      }
    }
  )

  }

  isClosed = true;
  handelClick(): void {
    this.sidenav.toggle();
    this.isClosed = !this.isClosed;
  }
  ngAfterViewInit(): void {

    this.observer.observe(['(max-width: 800px)']).subscribe((res)=>{
      if(res.matches){
        this.sidenav.mode = 'over';
        this.sidenav.close()
      }
      else{
        this.sidenav.mode = 'side';
        this.sidenav.open()
      }
    })
  }
   
}
