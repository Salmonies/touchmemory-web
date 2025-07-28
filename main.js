import defaultQuestions from './default-questions.js';

let questions = [];
try {
  const stored = localStorage.getItem('questions');
  if (stored && Array.isArray(JSON.parse(stored))) {
    questions = JSON.parse(stored);
  } else {
    throw new Error();
  }
} catch {
  questions = defaultQuestions;
  localStorage.setItem('questions', JSON.stringify(questions));
}
// ✅ FULL main.js (updated)
// Screen elements


// Screen elements
const mainMenu = document.querySelector('.main-menu');
const categoryScreen = document.querySelector('.category-screen');
const questionsScreen = document.querySelector('.questions-screen');
const addQuestionScreen = document.querySelector('.add-question-screen');
const manageCategoriesScreen = document.querySelector('.manage-categories-screen');
const quizScreen = document.querySelector('.quiz-screen');

const checkboxContainer = document.getElementById('category_checkbox_container');
const questionList = document.getElementById('question_list');
const searchInput = document.getElementById('search_input');

const questionImageInput = document.getElementById('question_image_input');
const questionImagePreview = document.getElementById('question_image_preview');
const inputCorrectAnswer = document.getElementById('input_correct_answer');
const categoryContainer = document.getElementById('category_container');

const newCategoryInput = document.getElementById('input_new_category');
const addCategoryBtn = document.getElementById('button_add_category');
const backFromManageBtn = document.getElementById('button_back_from_manage');
const categoryListDiv = document.getElementById('category_list');
const questionItemTemplate = document.getElementById('question_item_template');

const startQuizBtn = document.getElementById('button_start_quiz');
const guestModeBtn = document.getElementById('button_guest_mode');
const backBtn = document.getElementById('button_back_to_main');
const goToCategoryBtn = document.getElementById('button_quiz');
const goToQuestionsBtn = document.getElementById('button_remove');
const backFromQuestionsBtn = document.getElementById('button_back_from_questions');
const addQuestionBtn = document.getElementById('button_add_question');
const saveQuestionBtn = document.getElementById('button_save');
const backFromAddBtn = document.getElementById('button_back_from_add');
const manageCategoriesBtn = document.getElementById('button_manage_categories');
const backFromQuizBtn = document.getElementById('button_back_from_quiz');

const quizImage = document.getElementById('quiz_image');
const quizButtons = document.getElementById('quiz_buttons');

let categories = JSON.parse(localStorage.getItem('categories') || '[]');
if (!categories.includes('All')) categories.unshift('All');
const categoryCheckBoxes = {};
let addCategoryCheckboxes = {};
let editingIndex = null;
let quizPool = [];
let recentQuestions = [];

const toast = document.createElement('div');
toast.className = 'toast hidden';
document.body.appendChild(toast);

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.classList.add('hidden'), 1000);
  }, 2000);
}

function saveCategoriesToStorage() {
  const toStore = categories.filter(cat => cat !== 'All');
  localStorage.setItem('categories', JSON.stringify(toStore));
}

function extractCategoriesFromStoredQuestions() {
  const data = JSON.parse(localStorage.getItem('questions') || '[]');
  const catSet = new Set();
  data.forEach(q => q.categories?.forEach(cat => catSet.add(cat)));
  const fromQuestions = Array.from(catSet);
  const allUnique = Array.from(new Set([...categories.filter(c => c !== 'All'), ...fromQuestions])).sort();
  categories = ['All', ...allUnique];
  saveCategoriesToStorage();
}

function loadCategories() {
  checkboxContainer.innerHTML = '';
  categories.forEach(category => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = category;
    checkbox.id = `cat-${category}`;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(category));
    checkboxContainer.appendChild(label);
    categoryCheckBoxes[category] = checkbox;

    checkbox.addEventListener('change', () => {
      if (category === 'All') {
        const isChecked = checkbox.checked;
        for (const cat of categories) {
          if (cat !== 'All') categoryCheckBoxes[cat].checked = isChecked;
        }
      } else {
        const allCheckbox = categoryCheckBoxes['All'];
        const allChecked = categories.every(cat => cat === 'All' || categoryCheckBoxes[cat].checked);
        allCheckbox.checked = allChecked;
      }
    });
  });
}

function collectSelectedAndStart(guestMode) {
  const selected = categories.filter(cat => cat !== 'All' && categoryCheckBoxes[cat]?.checked);
  if (selected.length === 0) {
    alert('Please select at least one category');
    return;
  }
// <--line112--> Build quiz pools by category and streaks
const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
const matching = allQuestions.filter(q => q.categories.some(cat => selected.includes(cat)));

const priorityPool = [];
const masteredPool = [];

matching.forEach(q => {
  if (q.correctStreak >= 3) {
    masteredPool.push(q);
  } else {
    priorityPool.push(q);
  }
});

if (priorityPool.length === 0 && masteredPool.length === 0) {
  alert('No questions match selected categories');
  return;
}

window.priorityPool = priorityPool;
window.masteredPool = masteredPool;

  
  mainMenu.classList.add('hidden');
  categoryScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  showNextQuiz();

}
function showNextQuiz() {
  if (priorityPool.length === 0 && masteredPool.length === 0) {
    showToast('No questions remaining');
    return;
  }

  let sourcePool;
  if (priorityPool.length === 0) {
    sourcePool = masteredPool;
  } else if (masteredPool.length === 0) {
    sourcePool = priorityPool;
  } else {
    sourcePool = Math.random() < 0.7 ? priorityPool : masteredPool;
  }

  let question;
  let attempts = 0;
  do {
    const index = Math.floor(Math.random() * sourcePool.length);
    question = sourcePool[index];
    attempts++;
  } while (
    recentQuestions.includes(question.correctAnswer + question.imageUri) &&
    attempts < 20
  );
  const key = question.correctAnswer + question.imageUri;
  recentQuestions.push(key);
  if (recentQuestions.length > 3) recentQuestions.shift();

  quizImage.src = question.imageUri;
  quizButtons.innerHTML = '';

  const answers = [question.correctAnswer];
  const questions = JSON.parse(localStorage.getItem('questions') || '[]');

  const keywords = question.correctAnswer.toLowerCase().split(/\s+/);
  const scored = questions
    .filter(q => q.correctAnswer !== question.correctAnswer)
    .map(q => {
      const otherWords = q.correctAnswer.toLowerCase().split(/\s+/);
      const matchScore = keywords.reduce(
        (score, word) => score + (otherWords.includes(word) ? 1 : 0),
        0
      );
      return { answer: q.correctAnswer, score: matchScore };
    })
    .sort((a, b) => b.score - a.score || a.answer.localeCompare(b.answer));

  const dummyAnswers = scored.slice(0, 10).map(s => s.answer);
  while (answers.length < 4 && dummyAnswers.length) {
    const i = Math.floor(Math.random() * dummyAnswers.length);
    answers.push(dummyAnswers.splice(i, 1)[0]);
  }

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.addEventListener('click', () => {
      const isCorrect = answer === question.correctAnswer;
      btn.style.backgroundColor = isCorrect ? 'green' : 'red';
      Array.from(quizButtons.children).forEach(b => {
        if (b.textContent === question.correctAnswer) b.style.backgroundColor = 'green';
        if (b !== btn) b.disabled = true;
      });

      if (isCorrect) {
        question.correctStreak = (question.correctStreak || 0) + 1;
        question.incorrectStreak = 0;
        if (question.correctStreak > 3) question.correctStreak = 3;
      } else {
        question.correctStreak = 0;
        question.incorrectStreak = (question.incorrectStreak || 0) + 1;
        if (question.incorrectStreak > 2) question.incorrectStreak = 2;
      }

      const inPriority = priorityPool.indexOf(question);
      const inMastered = masteredPool.indexOf(question);

      if (question.correctStreak >= 3 && inPriority !== -1) {
        priorityPool.splice(inPriority, 1);
        masteredPool.push(question);
      } else if (question.incorrectStreak >= 2 && inMastered !== -1) {
        masteredPool.splice(inMastered, 1);
        priorityPool.push(question);
      }

      const all = JSON.parse(localStorage.getItem('questions') || '[]');
      const updated = all.map(q =>
        q.correctAnswer === question.correctAnswer && q.imageUri === question.imageUri
          ? question
          : q
      );
      localStorage.setItem('questions', JSON.stringify(updated));

      setTimeout(showNextQuiz, 1000);
    });
      
    quizButtons.appendChild(btn);
  });
};

// Navigation and event bindings
goToCategoryBtn.addEventListener('click', () => {
  extractCategoriesFromStoredQuestions();
  mainMenu.classList.add('hidden');
  categoryScreen.classList.remove('hidden');
  loadCategories();
});

goToQuestionsBtn.addEventListener('click', () => {
  mainMenu.classList.add('hidden');
  questionsScreen.classList.remove('hidden');
  searchInput.value = '';
  questionList.innerHTML = '';
});

addQuestionBtn.addEventListener('click', () => {
  questionsScreen.classList.add('hidden');
  addQuestionScreen.classList.remove('hidden');
  resetAddQuestionForm();
  loadAddCategories();
});

backFromAddBtn.addEventListener('click', () => {
  addQuestionScreen.classList.add('hidden');
  questionsScreen.classList.remove('hidden');
});

backFromQuestionsBtn.addEventListener('click', () => {
  questionsScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});

backFromQuizBtn.addEventListener('click', () => {
  quizScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
  categoryScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});

startQuizBtn.addEventListener('click', () => collectSelectedAndStart(false));
guestModeBtn.addEventListener('click', () => collectSelectedAndStart(true));

function resetAddQuestionForm() {
  questionImageInput.value = '';
  questionImagePreview.src = '';
  inputCorrectAnswer.value = '';
  categoryContainer.innerHTML = '';
  addCategoryCheckboxes = {};
  editingIndex = null;
}

function loadAddCategories(preSelected = []) {
  extractCategoriesFromStoredQuestions();
  categoryContainer.innerHTML = '';

  const allLabel = document.createElement('label');
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.value = 'All';
  allLabel.appendChild(allCheckbox);
  allLabel.appendChild(document.createTextNode('All'));
  categoryContainer.appendChild(allLabel);
  addCategoryCheckboxes['All'] = allCheckbox;

  allCheckbox.addEventListener('change', () => {
    const checked = allCheckbox.checked;
    Object.entries(addCategoryCheckboxes).forEach(([cat, cb]) => {
      if (cat !== 'All') cb.checked = checked;
    });
  });

  categories.slice(1).forEach(cat => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    if (preSelected.includes(cat)) checkbox.checked = true;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(cat));
    categoryContainer.appendChild(label);
    addCategoryCheckboxes[cat] = checkbox;

    checkbox.addEventListener('change', () => {
      const allChecked = categories.slice(1).every(c => addCategoryCheckboxes[c]?.checked);
      allCheckbox.checked = allChecked;
    });
  });
}

questionImageInput.addEventListener('change', () => {
  const file = questionImageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      questionImagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const baseName = file.name.replace(/\.[^.]+$/, '');
    inputCorrectAnswer.value = baseName;
  }
});

saveQuestionBtn.addEventListener('click', () => {
  const correctAnswer = inputCorrectAnswer.value.trim();
  const imageSrc = questionImagePreview.src;
  const selectedCats = Object.keys(addCategoryCheckboxes).filter(
    cat => cat !== 'All' && addCategoryCheckboxes[cat].checked
  );

  if (!imageSrc || !correctAnswer || selectedCats.length === 0) {
    alert('Please fill out all fields and select an image.');
    return;
  }

  const questions = JSON.parse(localStorage.getItem('questions') || '[]');

  if (editingIndex === null) {
    const duplicate = questions.some(
      q => q.correctAnswer.toLowerCase() === correctAnswer.toLowerCase()
    );
    if (duplicate) {
      alert('This question already exists.');
      return;
    }
    questions.push({
      imageUri: imageSrc,
      correctAnswer,
      categories: selectedCats,
      correctStreak: 0,
      incorrectStreak: 0
    });
  } else {
    questions[editingIndex].correctAnswer = correctAnswer;
    questions[editingIndex].imageUri = imageSrc;
    questions[editingIndex].categories = selectedCats;
  }

  localStorage.setItem('questions', JSON.stringify(questions));
  showToast('Question saved!');
  resetAddQuestionForm();
  loadAddCategories();

});

function refreshQuestionList(filter = '') {
  const questions = JSON.parse(localStorage.getItem('questions') || '[]');
  const lowerFilter = filter.toLowerCase().trim();
  const filtered = lowerFilter
    ? questions.filter(q => q.correctAnswer.toLowerCase().includes(lowerFilter))
    : questions;

  questionList.innerHTML = '';
  filtered.forEach((q, index) => {
    const item = questionItemTemplate.content.cloneNode(true);
    item.querySelector('.thumbnail').src = q.imageUri;
    item.querySelector('.question-answer').textContent = q.correctAnswer;
    item.querySelector('.question-categories').textContent = q.categories.join(', ');
    item.querySelector('.delete-button').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete question "${q.correctAnswer}"?`)) {
        
        const fullList = JSON.parse(localStorage.getItem('questions') || '[]');
        const updated = fullList.filter(qItem =>
          !(qItem.correctAnswer === q.correctAnswer && qItem.imageUri === q.imageUri)
        );
        localStorage.setItem('questions', JSON.stringify(updated));
    
       
        refreshQuestionList(searchInput.value);
      }
    });
    item.querySelector('.question-item').addEventListener('click', () => {
      editingIndex = index;
      inputCorrectAnswer.value = q.correctAnswer;
      questionImagePreview.src = q.imageUri;
      loadAddCategories(q.categories);
      questionsScreen.classList.add('hidden');
      addQuestionScreen.classList.remove('hidden');
    });
    questionList.appendChild(item);
  });
}

searchInput.addEventListener('input', () => {
  const value = searchInput.value.trim();
  if (value === '') {
    questionList.innerHTML = '';
    return;
  }
  refreshQuestionList(value);
});

manageCategoriesBtn.addEventListener('click', () => {
  addQuestionScreen.classList.add('hidden');
  manageCategoriesScreen.classList.remove('hidden');
  loadCategoryListUI();
});

backFromManageBtn.addEventListener('click', () => {
  manageCategoriesScreen.classList.add('hidden');
  addQuestionScreen.classList.remove('hidden');
  loadAddCategories();
});

addCategoryBtn.addEventListener('click', () => {
  const newCat = newCategoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    categories = ['All', ...categories.filter((c, i, a) => c !== 'All' && a.indexOf(c) === i).sort()];
    saveCategoriesToStorage();
    newCategoryInput.value = '';
    loadCategoryListUI();
  }
});

function loadCategoryListUI() {
  categoryListDiv.innerHTML = '';
  categories.slice(1).forEach(cat => {
    const div = document.createElement('div');
    div.textContent = cat + ' ';

    const renameBtn = document.createElement('button');
    renameBtn.textContent = 'Rename';
    renameBtn.addEventListener('click', () => {
      const newName = prompt(`Rename category "${cat}" to:`, cat);
      if (newName && newName !== cat && !categories.includes(newName)) {
        const questions = JSON.parse(localStorage.getItem('questions') || '[]');
        questions.forEach(q => {
          if (q.categories?.includes(cat)) {
            q.categories = q.categories.map(c => c === cat ? newName : c);
          }
        });
        localStorage.setItem('questions', JSON.stringify(questions));
        categories = ['All', ...categories.filter(c => c !== cat && c !== 'All'), newName].sort();
        saveCategoriesToStorage();
        loadCategoryListUI();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      if (confirm(`Delete category "${cat}"?`)) {
        categories = ['All', ...categories.filter(c => c !== cat && c !== 'All')];
        const questions = JSON.parse(localStorage.getItem('questions') || '[]');
        questions.forEach(q => {
          if (q.categories?.includes(cat)) {
            q.categories = q.categories.filter(c => c !== cat);
          }
        });
        localStorage.setItem('questions', JSON.stringify(questions));
        saveCategoriesToStorage();
        loadCategoryListUI();
      }
    });

    div.appendChild(renameBtn);
    div.appendChild(delBtn);
    categoryListDiv.appendChild(div);
  });
}
// Register the service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
