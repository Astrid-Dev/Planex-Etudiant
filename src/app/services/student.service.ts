import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {AuthStateService} from "./auth-state.service";
import {HttpClient} from "@angular/common/http";
import {Etudiant} from "../models/Etudiant";
import {Filiere} from "../models/Filiere";
import {Niveau} from "../models/Niveau";
import {Faculte} from "../models/Faculte";
import {Classe} from "../models/Classe";
import {Ue} from "../models/Ue";
import {GroupeCours} from "../models/GroupeCours";
import {GroupeTd} from "../models/GroupeTd";
import {PlanningCours} from "../models/PlanningCours";
import {Enseignant} from "../models/Enseignant";
import {Salle} from "../models/Salle";
import {Td} from "../models/Td";
import {Jour, Periode} from "../models/TypeHoraire";
import {Activity, DayActivies} from "../models/Activity";
import {DateHelper} from "../helpers/date.helper";

const STUDENTS_URL = environment.BACKEND_URL +"/etudiants";

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private student: Etudiant | null = null;
  private sector: Filiere | null = null;
  private level: Niveau | null = null;
  private faculty: Faculte | null = null;
  private classroom: Classe | null = null;

  private coursesPlanning: PlanningCours[] = [];
  private teachingUnits: Ue[] = [];
  private tutorials: Td[] = [];
  private coursesGroups: GroupeCours[] = [];
  private tutorialsGroups: GroupeTd[] = [];
  private teachers: Enseignant[] = [];
  private rooms: Salle[] = [];
  private periods: Periode[] = [];

  private days: Jour[] = [];

  private hasLoadedDatas: boolean = false;

  constructor(private authState: AuthStateService, private http: HttpClient) { }

  loadCurrentStudentDatas()
  {
    return new Promise((resolve, reject) =>{
      let student = this.authState.getUser();
      if(student !== null)
      {
        this.http.get(STUDENTS_URL+"/"+student.id)
          .subscribe({
            next: (res: any) =>{
              console.log(res);
              this.student = res.etudiant;
              this.sector = res.filiere;
              this.level = res.niveau;
              this.faculty = res.faculte;
              this.classroom = res.classe;

              this.coursesPlanning = res.plannings.planning_cours;
              this.days = res.plannings.jours;
              this.teachingUnits = res.plannings.ues;
              this.tutorials = res.plannings.tds;
              this.coursesGroups = res.plannings.groupes_cours;
              this.tutorialsGroups = res.plannings.groupes_tds;
              this.teachers = res.plannings.enseignants;
              this.rooms = res.plannings.salles;
              this.periods = res.plannings.periodes;

              this.hasLoadedDatas = true;
              resolve(res);
            },
            error: (err) =>{
              this.hasLoadedDatas = false;
              reject(err);
            }
          })
      }
      else
      {
        reject("No user found !");
      }
    })
  }

  get currentStudent()
  {
    return this.student;
  }

  get studentSector()
  {
    return this.sector;
  }

  get studentLevel()
  {
    return this.level;
  }

  get studentClassroom()
  {
    return this.classroom;
  }

  get teachersOfStudentClass()
  {
    return this.teachers;
  }

  get teachingUnitsOfStudentClass()
  {
    return this.teachingUnits;
  }

  get tutorialsOfStudentClass()
  {
    return this.tutorials;
  }

  get roomsOfStudentClass()
  {
    return this.rooms;
  }

  get coursesGroupsOfStudentClass()
  {
    return this.coursesGroups;
  }

  get tutorialsGroupsOfStudentClass()
  {
    return this.tutorialsGroups;
  }

  get coursesPlanningOfStudentClass()
  {
    return this.coursesPlanning;
  }

  get periodsOfStudentClass()
  {
    return this.periods;
  }

  get studentCoursesDays()
  {
    return this.days;
  }

  get hasLoaded()
  {
    return this.hasLoadedDatas;
  }

  getCoursePlanningOnADay(dayNumber: number)
  {
    return this.coursesPlanning.filter((elt) =>{
      let day = this.days.find(tmp => tmp.id === elt.jourId);
      return day?.id === dayNumber;
    });
  }

  getActivitiesOfStudentOnADay(dayNumber: number)
  {
    let result: Activity[] = [];

    this.getCoursePlanningOnADay(dayNumber).forEach((elt) =>{
      if(elt.tdId !== null || elt.ueId !== null)
      {
        let principalTeacher: Enseignant | undefined | null = elt.enseignant1Id !== null ? this.teachers.find(ens => ens.id === elt.enseignant1Id) : null;
        let othersTeachers: Enseignant[] = [];
        if(elt.enseignant2Id !== null)
        {
          let temp: Enseignant | undefined = this.teachers.find(ens => ens.id === elt.enseignant2Id);
          if(temp) {
            othersTeachers.push(temp)
          }
        }
        if(elt.enseignant3Id !== null)
        {
          let temp: Enseignant | undefined = this.teachers.find(ens => ens.id === elt.enseignant3Id);
          if(temp) {
            othersTeachers.push(temp)
          }
        }
        if(elt.enseignant4Id !== null)
        {
          let temp: Enseignant | undefined = this.teachers.find(ens => ens.id === elt.enseignant4Id);
          if(temp) {
            othersTeachers.push(temp)
          }
        }

        let teachingUnit = this.teachingUnits.find(teach => teach.id === elt.ueId);
        let tutorial = this.tutorials.find(tut => tut.id === elt.tdId);

        let activityName = elt.tdId !== null ? tutorial?.code : teachingUnit?.code;

        let period: Periode | undefined = this.periods.find(per => per.id === elt.periodeId);
        if(!period)
        {
          period = {
            debut: "0",
            fin: "0",
            debut_en: "0",
            fin_en: "0"
          }
        }

        let driftFrom: Ue | null | undefined = tutorial ? this.teachingUnits.find(temp => temp.id === tutorial?.ueId): null;

        let room: Salle | undefined = this.rooms.find(temp => temp.id === elt.salleId);

        let courseGroup: GroupeCours | undefined = this.coursesGroupsOfStudentClass.find(temp => temp.id === elt.groupeCoursId);
        let tutorialGroup: GroupeTd | undefined = this.tutorialsGroups.find(temp => temp.id === elt.groupeTdId);

        let group: any = courseGroup ? courseGroup : tutorialGroup ? tutorialGroup : null;
        result.push({
          id: result.length + 1,
          name: ""+activityName,
          participation: {
            allStudentsParticipate: group === null,
            groupIsDivideByAlphabet: typeof group?.lettre_debut !== "undefined",
            groupeName: group?.nom,
            beginningLetter: group?.lettre_debut ? group.lettre_debut : "",
            endingLetter: group?.lettre_fin ? group.lettre_fin : "",
          },
          day: "",
          description: {
            isCourse: elt.ueId !== null,
            isTutorial: elt.tdId !== null,
          },
          entitled: teachingUnit?.intitule,
          entitled_en: teachingUnit?.intitule_en,
          driftFrom: driftFrom,
          othersInvolvedTeachers: othersTeachers,
          period: period,
          principalTeacher: principalTeacher ? principalTeacher : null,
          room: room ? room : null
        })
      }
    })

    return result;
  }

  get currentDayCoursesPlanning()
  {
    let currentDayNumber = new Date().getDay();
    return this.getCoursePlanningOnADay(currentDayNumber);
  }

  get currentDayActivitiesOfStudent()
  {
    let currentDayNumber = new Date().getDay();

    return this.getActivitiesOfStudentOnADay(currentDayNumber);
  }

  restOfWeekActiviesOfStudent()
  {
    let currentDayNumber = new Date().getDay();
    let possiblesDays = this.studentCoursesDays;
    possiblesDays.sort((day1, day2) =>{
      let dayNumber1: number = ((day1.numero !== 0 && currentDayNumber !== 0) || (day1.numero === currentDayNumber)) ? day1.numero : 7;
      let dayNumber2: number = ((day2.numero !== 0 && currentDayNumber !== 0) || (day2.numero === currentDayNumber)) ? day2.numero : 7;

      if(dayNumber1 === currentDayNumber)
      {
        dayNumber1 = -100;
      }
      else if(dayNumber1 < currentDayNumber)
      {
        dayNumber1 = 100;
      }

      if(dayNumber2 === currentDayNumber)
      {
        dayNumber2 = -100;
      }
      else if(dayNumber2 < currentDayNumber)
      {
        dayNumber2 = 100;
      }

      if(dayNumber1 > dayNumber2)
      {
        return 1;
      }
      else if(dayNumber1 < dayNumber2)
      {
        return -1;
      }
      else{
        return 0;
      }
    });
    let result: DayActivies[] = [];
    possiblesDays.forEach((day, index) =>{
      let dayDate = new Date((new Date().getTime() + (index * 3600*24*1000)));
      result.push({
        id: result.length + 1,
        dayDate: dayDate,
        activities: this.getActivitiesOfStudentOnADay(day.numero),
        displayDay: DateHelper.getADayName(day.numero)
      });
    });

    return result;

  }

  reset()
  {
    this.hasLoadedDatas = false;
    this.classroom = null;
    this.sector = null;
    this.student = null;
    this.faculty = null;
    this.level = null;
  }

}
