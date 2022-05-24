import {AfterViewInit, Component, OnInit} from '@angular/core';
import {StudentService} from "../../services/student.service";
import {TranslationService} from "../../services/translation.service";
import {Salle} from "../../models/Salle";
import {Activity, ActivityDetails, DayActivies} from "../../models/Activity";
import {NgxSmartModalService} from "ngx-smart-modal";

const MODAL_ID = "activityDetails";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  pageTitle = "";

  lastCollapsedItemIndex: number | null = null;

  hasLoadedDatas: boolean | null = null;
  weekActivities: DayActivies[] = [];

  modal: any = null;

  constructor(
    private studentService: StudentService,
    private translationService: TranslationService,
    private ngxSmartModalService: NgxSmartModalService
  ) {
  }

  ngOnInit(): void {
    this.pageTitle = "HOME.TITLE";
    this.loadDatas();
  }

  ngAfterViewInit(): void {
    this.modal = this.ngxSmartModalService.getModal(MODAL_ID);
  }

  loadDatas()
  {
    this.hasLoadedDatas = null;
    if(this.studentService.hasLoaded)
    {
      this.hasLoadedDatas = true;
      this.setWeekActitivies();
    }
    else
    {
      this.studentService.loadCurrentStudentDatas()
        .then((res) =>{
          this.hasLoadedDatas = true;
          this.setWeekActitivies();
        })
        .catch((err) =>{
          console.error(err);
          this.hasLoadedDatas = false;
        });
    }
  }

  setWeekActitivies(){
    this.weekActivities = this.getWeekActivities();
    let temp = this.weekActivities[0];

    temp.activities = temp.activities.filter((activity) =>{
      let currentDate = new Date();
      let involvedDate = new Date();

      let endHourOfPeriod = parseInt(activity.period.fin.split("h")[0].trim());
      let endMinuteOfPeriod = parseInt(activity.period.fin.split("h")[1].trim());
      involvedDate.setHours(endHourOfPeriod, endMinuteOfPeriod);

      return currentDate.getTime() <= involvedDate.getTime();
    });

    this.weekActivities[0] = temp;

  }

  get tutorials()
  {
    return this.studentService.tutorialsOfStudentClass;
  }

  get teachingUnits()
  {
    return this.studentService.teachingUnitsOfStudentClass;
  }

  get teachers()
  {
    return this.studentService.teachersOfStudentClass;
  }

  get coursesGroups()
  {
    return this.studentService.coursesGroupsOfStudentClass;
  }

  get tutorialsGroups()
  {
    return this.studentService.tutorialsGroupsOfStudentClass;
  }

  get rooms()
  {
    return this.studentService.roomsOfStudentClass;
  }

  get currentDayActivities()
  {
    return this.studentService.currentDayActivitiesOfStudent;
  }

  getWeekActivities(){
    return this.studentService.restOfWeekActiviesOfStudent();
  }

  printActivity(activity: Activity)
  {
    let result = activity.name;
    if(!activity.participation.allStudentsParticipate)
    {
      result += ", "+activity.participation.groupeName;
    }

    return result;
  }

  printDayName(index: number, dayKey: string)
  {
    if(index === 0)
    {
      return this.translationService.getValueOf("DAYS.TODAY");
    }
    else if(index === 1)
    {
      return this.translationService.getValueOf("DAYS.TOMORROW");
    }
    else{
      return this.translationService.getValueOf(dayKey);
    }
  }

  printDayActivityName(dayActivity: DayActivies, index: number)
  {
    return this.printDayName(index, dayActivity.displayDay) + ", " + dayActivity.dayDate.toLocaleDateString();
  }

  printPeriod(period: any)
  {
    let startField = "debut";
    let endField = "fin";
    if(period)
      return this.translationService.getCurrentLang() === "fr" ?( period[startField] + " - " + period[endField]) : (period[startField+"_en"] + " - " + period[endField+"_en"]);
    else
      return "Inconnue";
  }

  printRoom(room: Salle | null)
  {
    return room === null ? "Non renseignée" : room.code;
  }

  onCollapse(itemIndex: number)
  {
    if(this.lastCollapsedItemIndex === itemIndex)
    {
      this.lastCollapsedItemIndex = null;
    }
    else{
      this.lastCollapsedItemIndex = itemIndex;
    }
  }

  isActiveItem(itemIndex: number)
  {
    return this.lastCollapsedItemIndex === itemIndex;
  }

  getRASTypeOf(itemIdex: number){
    if(this.weekActivities[itemIdex].activities.length === 0 && this.getWeekActivities()[itemIdex]?.activities.length !== 0)
    {
      return 'HOME.RAS2';
    }
    else{
      return 'HOME.RAS';
    }
  }

  onDetailsClick(activityIndex: number, dayIndex: number = -1)
  {
    let selectedActivity: any = null;
    let displayDay: string = "";
    let dayDate: Date;

    if(dayIndex === -1)
    {
      selectedActivity = this.currentDayActivities[activityIndex];
      displayDay = this.printDayActivityName(this.weekActivities[0], 0);
      dayDate = this.weekActivities[0].dayDate;
    }
    else{
      selectedActivity = this.weekActivities[dayIndex].activities[activityIndex];
      displayDay = this.printDayActivityName(this.weekActivities[dayIndex], dayIndex);
      dayDate = this.weekActivities[dayIndex].dayDate;
    }

    let result: ActivityDetails = {
      activity: selectedActivity,
      dayDate: dayDate,
      displayDay: displayDay
    }

    console.log(result);
    this.modal.setData(result, true);
    this.modal.open();
  }

}
