import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

const COURSES_PLANNING_URL = environment.BACKEND_URL + "/planning_cours_et_tds";

@Injectable({
  providedIn: 'root'
})
export class PlanningCoursesService {



  constructor(
    private http: HttpClient
  ) { }

  loadClassroomPlanning(classroomId: number)
  {
    return new Promise((resolve, reject) =>{
      this.http.get(COURSES_PLANNING_URL + "/"+classroomId)
        .subscribe({
          next: (res) =>{
            resolve(res);
          },
          error: (err) =>{
            reject(err);
          }
        })
    })
  }
}
