import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UsersDataSource} from "../data/users-data-source";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
import {fromEvent, merge} from "rxjs";
import {debounceTime, distinctUntilChanged, tap} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {UserStatus} from "../../models/user.status";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit {
    users!: UsersDataSource;
    displayedColumns: string[] = ['company', 'username', 'email', 'tel', 'status', 'reseller', 'producer', 'actions'];
    totalUsers: number = 0;
    userStatus = UserStatus;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private userService: UserService,
        private toastr: ToastrService,
        public router: Router
    ) {
    }

    ngOnInit(): void {
        this.users = new UsersDataSource(this.userService);
        this.users.loadUsers();
    }

    ngAfterViewInit(): void {
        this.countAllUsers();

        // server-side search
        fromEvent(this.input.nativeElement, 'keyup').pipe(
            debounceTime(500),
            distinctUntilChanged(),
            tap(() => {
                this.paginator.pageIndex = 0;
                this.loadUsersPage();
                this.countAllUsers();
            })
        ).subscribe();

        // reset the paginator after sorting
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page).pipe(
            tap(() => {
                this.loadUsersPage();
            })
        ).subscribe();
    }

    loadUsersPage(): void {
        this.users.loadUsers(
            this.input.nativeElement.value,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    countAllUsers(): void {
        this.userService.countAllUsers(
            this.input.nativeElement.value
        ).subscribe(
            (totalUsers: number) => {
                this.totalUsers = totalUsers;
            }
        );
    }

    editUser(idUser: string): void {
        this.router.navigate(['user', 'edit', idUser]).then();
    }

    deleteUser(idUser: string): void {
        Swal.fire({
            title: `Supprimer l\'utilisateur`,
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
            showConfirmButton: true,
            confirmButtonText: 'Supprimer',
            showCancelButton: true,
            cancelButtonText: 'Annuler'
        }).then(
            (result) => {
                if (result.isConfirmed) {
                    this.userService.deleteUser(idUser).subscribe({
                        next: () => {
                            this.loadUsersPage();
                            this.toastr.success('L\'utilisateur a été supprimé', 'Supprimer');
                        },
                        error: error => {
                            console.error(error);
                            if (Array.isArray(error)) {
                                error.map((err: string) => {
                                    this.toastr.error(err, 'Error !');
                                })
                            } else {
                                this.toastr.error(error, 'Error !');
                            }
                        }
                    })
                }
            }
        )
    }
}
