import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NgxSmartModalComponent, NgxSmartModalService} from "ngx-smart-modal";
import {TranslationService} from "../../services/translation.service";
import {Activity} from "../../models/Activity";

const MODAL_ID = "activityDetails";

@Component({
  selector: 'app-modal-activity-details',
  templateUrl: './modal-activity-details.component.html',
  styleUrls: ['./modal-activity-details.component.scss']
})
export class ModalActivityDetailsComponent implements OnInit, AfterViewInit {

  modal: any = null;

  constructor(private ngxSmartModalService: NgxSmartModalService, private translationService: TranslationService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.modal = this.ngxSmartModalService.getModal(MODAL_ID);
    this.modal.addCustomClass("nsm-centered");
    this.modal.onAnyCloseEventFinished.subscribe((mountModal: NgxSmartModalComponent) =>{
      this.modal.removeData();
    });
  }

  get datas()
  {
    return this.modal !== null ? this.modal.getData(): null;
  }

  get hasData()
  {
    return this.modal !== null && this.modal.hasData();
  }

  get activity(){
    return this.datas?.activity;
  }

  printActivity()
  {
    let result = this.activity?.name;
    if(!this.activity?.participation?.allStudentsParticipate)
    {
      result += ", "+this.activity?.participation?.groupeName;
    }

    return result;
  }

  getTeacherOffice(office: string)
  {
    if(office !== null && office !== "")
    {
      return office;
    }
    else{
      return "Inconnu";
    }
  }

  printPeriod(period: any)
  {
    let startField = "debut";
    let endField = "fin";
    if(period)
      return this.translationService.getCurrentLang() === "fr" ?( "De " + period[startField] + " À " + period[endField]) : ("From "+ period[startField+"_en"] + " To " + period[endField+"_en"]);
    else
      return "Inconnue";
  }

  printDescription()
  {
    let description = this.activity?.description;
    let name = this.activity?.name;
    let result = "";
    if(description.isCourse){
      result = "Cours magistral de " + name;
    }
    else if(description.isTutorial)
    {
      result = "Travaux dirigés de " + this.activity?.driftFrom.code;
    }

    if(!this.activity.participation.allStudentsParticipate)
    {
      result += (result !== "" ? " avec le " + this.activity.participation.groupeName : "-");
    }

    return result;
  }

  isDrifted()
  {
    return !this.activity.description.isCourse;
  }

  get entitled()
  {
    if(this.isDrifted())
    {
      return this.translationService.getCurrentLang() === "fr" ? this.activity.driftFrom.intitule : this.activity.intitule_en;
    }
    else{
      return this.translationService.getCurrentLang() === "fr" ? this.activity.entitled : this.activity.entitled_en;
    }

  }

  get participation()
  {
    return this.activity.participation.allStudentsParticipate ? "Toute la classe" : this.activity.participation.groupeName;
  }

  get groupConstitution()
  {
    if(this.activity.participation.allStudentsParticipate)
    {
      return null;
    }
    else{
      if(this.activity.participation.beginningLetter)
      {
        return "Etudiants allant de " + this.activity.participation.beginningLetter + " à " + this.activity.participation.endingLetter;
      }
      else{
        return "Diversifiée"
      }
    }
  }

  get roomCode()
  {
    if(this.activity?.room)
    {
      return this.activity.room.code;
    }
    else{
      return "Non renseignée";
    }
  }

  get othersTeachers()
  {
    if(this.activity?.othersInvolvedTeachers.length > 0)
    {
      let result = "";
      this.activity.othersInvolvedTeachers.forEach((teacher: any, index: number) =>{
        if(index !== 0)
        {
          result +=", ";
        }
        result += teacher.noms;

      });

      return result;
    }
    else{
      return "Aucun";
    }
  }

}
