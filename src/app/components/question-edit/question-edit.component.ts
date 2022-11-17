import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { IQuestionInfo, IOption } from '../../interfaces/question.interfaces';
import { localStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-question-edit',
  templateUrl: './question-edit.component.html',
  styleUrls: ['./question-edit.component.css'],
})
export class QuestionEditComponent implements OnInit {
  createQuestionForm!: FormGroup;
  questionOldData!: IQuestionInfo;

  constructor(private router: ActivatedRoute, private service: localStorageService) {}

  ngOnInit(): void {
    const indexOfQuestion = Number(this.router.snapshot.paramMap.get('index'));
    this.questionOldData = this.service.getQuestionCards().listOfQuestions[indexOfQuestion];

    this.createQuestionForm = new FormGroup({
      question: new FormControl(this.questionOldData.question, [Validators.required]),
      typeOfQuestion: new FormControl(this.questionOldData.typeOfQuestion, [Validators.required]),
      options: new FormArray([]),
    });

    this.loadOptionsData();
  }

  changeTypeOfQuestion(event: any): void {
    this.removeListOfOptions();
    this.addOption('correct');
    if (event.target.value !== 'Open') {
      this.addOption('wrong');
    }
  }

  loadOptionsData(): void {
    for (let i = 0; i < this.questionOldData.listOfOptions.length; i++) {
      this.questionOldData.listOfOptions[i].isRight
        ? this.addOption('correct', this.questionOldData.listOfOptions[i].option)
        : this.addOption('wrong', this.questionOldData.listOfOptions[i].option);
    }
  }

  addOption(type: string, value: string = ''): void {
    this.listOfOptions.push(
      new FormGroup({
        option: new FormControl(value, Validators.required),
        isRight: new FormControl(type !== 'wrong', Validators.required),
        isChosen: new FormControl(false, Validators.required),
      }),
    );
  }

  removeOption(idx: number): void {
    this.listOfOptions.removeAt(idx);
  }

  removeListOfOptions() {
    while (this.listOfOptions.length !== 0) {
      this.listOfOptions.removeAt(0);
    }
  }

  get listOfOptions() {
    return this.createQuestionForm.get('options') as FormArray;
  }

  get amountOfCorrectOptions() {
    return this.listOfOptions.value.filter((x: IOption) => x.isRight).length;
  }

  get amountOfWrongOptions() {
    return this.listOfOptions.value.filter((x: IOption) => !x.isRight).length;
  }

  previousPage() {
    this.service.moveTo('');
  }

  onSubmit(): void {
    if (this.createQuestionForm.invalid) {
      return;
    }

    this.service.setQuestionCard(
      {
        question: this.createQuestionForm.value.question,
        typeOfQuestion: this.createQuestionForm.value.typeOfQuestion,
        listOfOptions: this.listOfOptions.value,
        isAnswered: false,
        dateOfCreation: new Date(),
      },
      Number(this.router.snapshot.paramMap.get('index'))
    );
  }
}
