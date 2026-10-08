import { useState, type FormEvent } from 'react'
import {
  FiActivity,
  FiArrowUpRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiCrosshair,
  FiPlus,
  FiTrash2,
  FiX,
  FiZap,
} from 'react-icons/fi'
import { useIdleTimer } from 'react-idle-timer'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../App.css'

type Task = {
  id: number
  title: string
  time: string
  completed: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: 'Переглянути вимоги проєкту', time: '09:00', completed: true },
  { id: 2, title: 'Створити макет панелі', time: '10:30', completed: false },
  { id: 3, title: 'Інтегрувати React-бібліотеки', time: '12:00', completed: false },
  { id: 4, title: 'Перевірити адаптивність', time: '14:00', completed: false },
]

function App() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const [isFocusing, setIsFocusing] = useState(false)
  const [showIdlePrompt, setShowIdlePrompt] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [today] = useState(() =>
    new Intl.DateTimeFormat('uk-UA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date()),
  )

  const completedTasks = tasks.filter((task) => task.completed).length
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100)

  const idleTimer = useIdleTimer({
    timeout: 60_000,
    promptBeforeIdle: 15_000,
    stopOnIdle: true,
    onPrompt: () => setShowIdlePrompt(true),
    onIdle: () => {
      setShowIdlePrompt(false)
      setSessionPaused(true)
      setIsFocusing(false)
      toast.info('Сесію фокусу призупинено через тривалу бездіяльність.')
    },
    onActive: () => {
      setShowIdlePrompt(false)
      setSessionPaused(false)
    },
  })

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newTask.trim()

    if (!title) {
      toast.error('Спочатку введіть назву завдання.')
      return
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title, time: 'Будь-коли', completed: false },
    ])
    setNewTask('')
    toast.success('Завдання додано до плану.')
  }

  function toggleTask(taskId: number) {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item,
      ),
    )
    toast(task.completed ? 'Завдання повернуто до списку.' : 'Чудова робота — завдання виконано!', {
      icon: task.completed ? <FiActivity /> : <FiCheckCircle />,
    })
  }

  function deleteTask(taskId: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    toast.success('Завдання видалено.')
  }

  function toggleFocus() {
    const nextState = !isFocusing
    setIsFocusing(nextState)
    toast(nextState ? 'Режим фокусу увімкнено. У тебе все вийде!' : 'Фокусування призупинено.', {
      icon: nextState ? <FiZap /> : <FiCoffee />,
    })
  }

  function resumeSession() {
    idleTimer.activate()
    setSessionPaused(false)
    setShowIdlePrompt(false)
    toast.success('З поверненням! Сесію відновлено.')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Daylight home">
          <span className="brand-mark"><FiZap /></span>
          <span>daylight<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className={`session-status${sessionPaused ? ' is-paused' : ''}`}>
            <span className="status-dot" />
            {sessionPaused ? 'Сесію призупинено' : 'Сесія активна'}
          </span>
          <div className="avatar" aria-label="Your profile">A</div>
        </div>
      </header>

      <div className="dashboard" id="home">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">{today.toUpperCase()} <span>·</span> ТВОЄ ОСОБИСТЕ СЕРЕДОВИЩЕ</p>
            <h1>Час для <span>важливого.</span></h1>
            <p className="welcome-copy">Маленькі кроки щодня ведуть до великих результатів.</p>
          </div>
          <button
            className={`focus-button${isFocusing ? ' is-focusing' : ''}`}
            type="button"
            onClick={toggleFocus}
          >
            {isFocusing ? <FiCoffee /> : <FiZap />}
            {isFocusing ? 'Перепочити' : 'Почати фокус'}
          </button>
        </section>

        <section className="stats-grid" aria-label="Daily overview">
          <article className="stat-card">
            <div className="stat-icon lavender"><FiCheckCircle /></div>
            <div className="stat-label">Виконано завдань</div>
            <div className="stat-value">{completedTasks}<span> / {tasks.length}</span></div>
            <div className="stat-footnote"><span className="mini-trend"><FiArrowUpRight /></span> Не збавляй темп</div>
          </article>
          <article className="stat-card">
            <div className="stat-icon peach"><FiCrosshair /></div>
            <div className="stat-label">Прогрес за день</div>
            <div className="stat-value">{progress}<span>%</span></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </article>
          <article className="stat-card">
            <div className="stat-icon mint"><FiClock /></div>
            <div className="stat-label">Ціль фокусування</div>
            <div className="stat-value">4<span> год</span></div>
            <div className="stat-footnote">Час із користю</div>
          </article>
        </section>

        <section className="content-grid">
          <article className={`focus-card${isFocusing ? ' focus-card-active' : ''}`}>
            <div className="focus-card-top">
              <div>
                <div className="focus-icon"><FiZap /></div>
                <p className="card-overline">{isFocusing ? 'ТИ В ПОТОЦІ' : 'ЧАС ДЛЯ СЕБЕ'}</p>
                <h2>{isFocusing ? 'Один крок за раз.' : 'Зосередься на головному.'}</h2>
                <p className="focus-description">
                  {isFocusing
                    ? 'Присвяти увагу поточному завданню. Ми подбаємо про твою сесію.'
                    : 'Відклади зайве й приділи увагу наступному завданню.'}
                </p>
              </div>
              <div className="focus-illustration" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="illustration-sun"><FiZap /></div>
                <span className="spark spark-one">✦</span>
                <span className="spark spark-two">✧</span>
              </div>
            </div>
            <button className="focus-link" type="button" onClick={toggleFocus}>
              {isFocusing ? 'Призупинити фокус' : 'Почати сесію фокусу'} <FiArrowUpRight />
            </button>
            <div className="idle-note"><FiActivity /> Сесію буде призупинено, якщо ти надовго відійдеш.</div>
          </article>

          <article className="tasks-card">
            <div className="tasks-heading">
              <div>
                <p className="card-overline">ТВІЙ ПЛАН</p>
                <h2>Завдання на сьогодні <span className="task-count">{tasks.length}</span></h2>
              </div>
              <button
                className="icon-button clear-button"
                type="button"
                aria-label="Видалити виконані завдання"
                title="Видалити виконані завдання"
                onClick={() => {
                  const completedCount = tasks.filter((task) => task.completed).length
                  if (!completedCount) {
                    toast.info('Немає виконаних завдань для видалення.')
                    return
                  }
                  setTasks((currentTasks) => currentTasks.filter((task) => !task.completed))
                  toast.success(`Видалено виконаних завдань: ${completedCount}.`)
                }}
              >
                <FiTrash2 />
              </button>
            </div>

            <form className="add-task-form" onSubmit={addTask}>
              <FiPlus aria-hidden="true" />
              <input
                aria-label="Нове завдання"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Додай завдання на сьогодні..."
              />
              <button type="submit" aria-label="Add task"><FiPlus /></button>
            </form>

            <ul className="task-list">
              {tasks.map((task) => (
                <li className={`task-item${task.completed ? ' is-complete' : ''}`} key={task.id}>
                  <button
                    className="task-check"
                    type="button"
                    aria-label={`${task.completed ? 'Повернути' : 'Виконати'}: ${task.title}`}
                    aria-pressed={task.completed}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed && <FiCheck />}
                  </button>
                  <span className="task-title">{task.title}</span>
                  <span className="task-time"><FiClock /> {task.time}</span>
                  <button
                    className="icon-button delete-button"
                    type="button"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => deleteTask(task.id)}
                  >
                    <FiX />
                  </button>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="empty-tasks">
                  <FiCheckCircle />
                  <span>Поки все виконано. Додай завдання, коли будеш готовий.</span>
                </li>
              )}
            </ul>
            <div className="tasks-footer">
              <span><FiCheckCircle /> {completedTasks} of {tasks.length} completed</span>
              <span>{progress}% виконано</span>
            </div>
          </article>
        </section>

        <footer className="page-footer">
          <span>Маленькі кроки — до великих звершень.</span>
          <span><FiZap /> Усвідомлений робочий день</span>
        </footer>
      </div>

      {(showIdlePrompt || sessionPaused) && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="idle-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="idle-title"
            aria-describedby="idle-description"
          >
            <div className="idle-dialog-icon"><FiCoffee /></div>
            <p className="card-overline">{sessionPaused ? 'СЕСІЮ ПРИЗУПИНЕНО' : 'ТИ ЩЕ ТУТ?'}</p>
            <h2 id="idle-title">{sessionPaused ? 'З поверненням!' : 'Невелика перерва?'}</h2>
            <p id="idle-description">
              {sessionPaused
                ? 'Поки тебе не було, сесію фокусу призупинено. Продовжимо з того ж місця?'
                : 'Сесію скоро буде призупинено. Продовжуй зараз, щоб залишитися у фокусі.'}
            </p>
            <button className="focus-button" type="button" onClick={resumeSession}>
              <FiZap /> Я повернувся, продовжити
            </button>
          </section>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={2800}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        theme="light"
      />
    </main>
  )
}

export default App
