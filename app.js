// DOM要素の取得
const addTaskButton = document.getElementById('add-task-btn');
const taskInput = document.getElementById('new-task');
const contentInput = document.getElementById('new-content');
const dateInput = document.getElementById('entry-date');
const todoList = document.getElementById('todo-list');
const sortButton = document.getElementById('sort-btn');
const emotionButtons = document.querySelectorAll('.emotion-btn');

// 並べ替えの状態を管理（true: 新しい順, false: 古い順）
let sortDescending = true;

// 選択された感情を管理
let selectedEmotion = '';

// 感情ボタンのイベントリスナー
emotionButtons.forEach(button => {
  button.addEventListener('click', () => {
    // 全てのボタンから選択状態を解除
    emotionButtons.forEach(btn => btn.classList.remove('selected'));
    // クリックされたボタンを選択状態にする
    button.classList.add('selected');
    selectedEmotion = button.dataset.emotion;
  });
});

// 日付入力フィールドに今日の日付をデフォルトで設定
function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${year}-${month}-${day}`;
}

// ページロード時に今日の日付を設定
setDefaultDate();

// ローカルストレージから日記エントリーを取得して表示する関数
function loadTasks() {
  const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
  sortAndDisplayEntries(entries);
}

// エントリーを並べ替えて表示する関数
function sortAndDisplayEntries(entries) {
  // リストをクリア
  todoList.innerHTML = '';
  
  // 日付順に並べ替え
  const sortedEntries = entries.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortDescending ? dateB - dateA : dateA - dateB;
  });
  
  // 並べ替えたエントリーを表示
  sortedEntries.forEach(entry => {
    createTaskElement(entry.id, entry.date, entry.title, entry.content, entry.emotion);
  });
  
  // ボタンのテキストを更新
  sortButton.textContent = sortDescending ? '新しい順 ▼' : '古い順 ▲';
}

// 日記エントリーをローカルストレージに保存する関数
function saveTasks() {
  const entries = [];
  const listItems = todoList.querySelectorAll('li');
  listItems.forEach(item => {
    const id = item.dataset.id;
    const date = item.dataset.date;
    const title = item.querySelector('.entry-title').textContent;
    const content = item.dataset.content;
    entries.push({ id, date, title, content });
  });
  localStorage.setItem('diaryEntries', JSON.stringify(entries));
}

// 日記エントリーを追加する関数
function addTask() {
  const taskText = taskInput.value;
  const contentText = contentInput.value;
  const selectedDate = dateInput.value;

  if (taskText === "") {
    alert("タイトルを入力してください");
    return;
  }

  if (selectedDate === "") {
    alert("日付を選択してください");
    return;
  }

  // 既存のエントリーを取得
  const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
  
  // 新しいエントリーのデータを作成
  const id = Date.now().toString(); // 一意のIDとしてタイムスタンプを使用
  // 選択された日付を使用
  const date = selectedDate + 'T00:00:00.000Z';
  const title = taskText;
  const content = contentText;
  const emotion = selectedEmotion;

  // 新しいエントリーを配列に追加
  entries.push({ id, date, title, content, emotion });
  
  // ローカルストレージに保存
  localStorage.setItem('diaryEntries', JSON.stringify(entries));
  
  // エントリーを再読み込みして並べ替えを反映
  loadTasks();
  
  // テキストボックスとテキストエリアをクリア
  taskInput.value = '';
  contentInput.value = '';
  // 日付を今日にリセット
  setDefaultDate();
  // 感情の選択をリセット
  emotionButtons.forEach(btn => btn.classList.remove('selected'));
  selectedEmotion = '';
}

// 日記エントリー要素を作成する関数
function createTaskElement(id, date, title, content, emotion) {
  // エントリーのリスト要素を作成
  const listItem = document.createElement('li');
  listItem.dataset.id = id;
  listItem.dataset.date = date;
  listItem.dataset.content = content;
  listItem.dataset.emotion = emotion || '';

  // ヘッダー部分（日付、タイトル、削除ボタン）を作成
  const headerDiv = document.createElement('div');
  headerDiv.className = 'entry-header';

  // 日付を表示
  const dateLabel = document.createElement('span');
  dateLabel.className = 'entry-date';
  const dateObj = new Date(date);
  dateLabel.textContent = dateObj.toLocaleDateString('ja-JP');
  headerDiv.appendChild(dateLabel);

  // 感情を表示（選択されている場合）
  if (emotion) {
    const emotionLabel = document.createElement('span');
    emotionLabel.className = 'entry-emotion';
    emotionLabel.textContent = emotion;
    headerDiv.appendChild(emotionLabel);
  }

  // タイトルを表示
  const titleLabel = document.createElement('span');
  titleLabel.className = 'entry-title';
  titleLabel.textContent = title;
  headerDiv.appendChild(titleLabel);

  // エントリーを削除するための削除ボタンを追加
  const deleteButton = document.createElement('button');
  deleteButton.textContent = "削除";
  deleteButton.className = 'delete-btn';
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation(); // クリックイベントの伝播を防ぐ
    todoList.removeChild(listItem);
    saveTasks(); // 削除後に保存
  });

  headerDiv.appendChild(deleteButton);

  // 本文を表示するエリアを作成
  const contentDiv = document.createElement('div');
  contentDiv.className = 'entry-content';
  contentDiv.textContent = content || '（本文なし）';
  contentDiv.style.display = 'none'; // 初期状態は非表示

  // ヘッダーをクリックすると本文を表示/非表示
  headerDiv.addEventListener('click', () => {
    if (contentDiv.style.display === 'none') {
      contentDiv.style.display = 'block';
      listItem.classList.add('expanded');
    } else {
      contentDiv.style.display = 'none';
      listItem.classList.remove('expanded');
    }
  });

  listItem.appendChild(headerDiv);
  listItem.appendChild(contentDiv);
  todoList.appendChild(listItem);
}

// 並べ替えボタンのイベントリスナー
sortButton.addEventListener('click', () => {
  sortDescending = !sortDescending; // 並べ替え順を切り替え
  const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
  sortAndDisplayEntries(entries);
});

// エントリー追加ボタンのイベントリスナー
addTaskButton.addEventListener('click', addTask);

// Enterキーでエントリーを追加できるようにする
taskInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

// ページロード時にエントリーを読み込む
document.addEventListener('DOMContentLoaded', loadTasks);