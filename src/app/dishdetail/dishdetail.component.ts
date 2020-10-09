import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '../shared/task';
import { Location } from '@angular/common';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [visibility() ,flyInOut(), expand()]
})
export class DishdetailComponent implements OnInit {

  @ViewChild('myform') feedbackFormDirective;
  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  public feedbackForm: FormGroup;
  public task: Task;
  public abc=false;
  public view: FormGroup;
  dishcopy: Dish;
  visibility = 'shown';

  formErrors = {
    'name': '',
    'slide': '',
    'commentarea': ''
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('baseURL') private baseURL) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,errmess => this.errMess = <any>errmess);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess );
  }

  validationMessages = {
    'name': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'slide': {
      'required': 'Slide reading must be required'
    },
    'commentarea': {
      'required':      'feedback is required.',
      'minlength':     'feedback must be at least 2 characters long.',
      'maxlength':     'feedback cannot be more than 25 characters long.'
    },
  };

  formatLabel(value: number) {
    return value;
  }
  goBack(): void {
    this.location.back();
  }
  
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  createForm()
  {
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      slide: ['', [Validators.required] ],
      commentarea: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ]
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }
  onSubmit()
  {
    this.abc=true;
    this.task = this.feedbackForm.value;
    this.view = this.feedbackForm.value;
    this.feedbackForm.reset({
      name: '',
      slide: '5',
      commentarea: '',
    });
    const com: Comment = {
      rating: Number(this.task.slide),
      comment: this.task.commentarea,
      author: this.task.name,
      date: Date.now().toString()
    }
    this.feedbackFormDirective.resetForm();
    this.dishcopy.comments.push(com);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
  }
  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}
