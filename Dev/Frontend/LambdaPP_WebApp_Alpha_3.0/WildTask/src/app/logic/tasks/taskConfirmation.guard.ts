import { inject } from "@angular/core";
import { ActivatedRoute, CanActivateFn, Router } from "@angular/router"
import { TaskCreationService } from "./task-creation/task-creation.service";
import Swal from "sweetalert2";

export const taskConfirmationGuard : CanActivateFn = (route, state) => {

    const router = inject(Router);
    const data = inject(TaskCreationService)
    const activatedRoute = inject(ActivatedRoute)

    if(router.url == "/main/tasks/task-steps/task-confirmation")
    {
        let theData = null;

        data.currentData.subscribe(myData => {
            theData = myData
            console.log(myData)
        })

        if(theData != null)
        {
            return true;
            console.log("HERE!")
        }
        else {
            Swal.fire("Not Allowed", "Please insert task details first", "warning")
            // router.navigate(["../create-task"], {relativeTo: activatedRoute})
            return false;
        }
    }
    else
    {
        Swal.fire("Not Allowed", "Please insert task details first", "warning")
        // router.navigate(["../create-task"], {relativeTo: activatedRoute})
        return false;
    }
}