import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UserListComponent} from "./user-list/user-list.component";
import {UserAddComponent} from "./user-add/user-add.component";
import {UserEditComponent} from "./user-edit/user-edit.component";
import {UserWaitingPassageComponent} from "./user-waiting-passage/user-waiting-passage.component";
import {UserPresentationComponent} from "./user-presentation/user-presentation.component";

const routes: Routes = [
    {
        path: '',
        component: UserListComponent
    },
    {
        path: 'add',
        component: UserAddComponent
    },
    {
        path: 'edit/:idUser',
        component: UserEditComponent
    },
    {
        path: 'waiting-passage',
        component: UserWaitingPassageComponent
    },
    {
        path: ':idUser/presentation',
        component: UserPresentationComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {
}
