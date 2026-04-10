import { useState, useCallback, useMemo } from 'react';
import { questions, specialQuestions } from '../data/questions';
import type { Question, SpecialQuestion } from '../data/questions';
import { computeResult } from '../lib/compute';
import type { ComputeResult } from '../lib/compute';

interface TestScreenProps {
  onSubmit: (result: ComputeResult) => void;
  onBackHome: () => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type DisplayQuestion = Question | SpecialQuestion;

export function TestScreen({ onSubmit, onBackHome }: TestScreenProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Build shuffled questions on first render
  const shuffledQuestions = useMemo(() => {
    const shuffled = shuffle(questions);
    const insertIndex = Math.floor(Math.random() * shuffled.length) + 1;
    return [
      ...shuffled.slice(0, insertIndex),
      specialQuestions[0],
      ...shuffled.slice(insertIndex)
    ];
  }, []);

  // Get visible questions (conditionally include drink_trigger)
  const visibleQuestions = useMemo(() => {
    const visible: DisplayQuestion[] = [...shuffledQuestions];
    const gateIndex = visible.findIndex(q => q.id === 'drink_gate_q1');
    if (gateIndex !== -1 && answers['drink_gate_q1'] === 3) {
      visible.splice(gateIndex + 1, 0, specialQuestions[1]);
    }
    return visible;
  }, [shuffledQuestions, answers['drink_gate_q1']]);

  const total = visibleQuestions.length;
  const done = visibleQuestions.filter(q => answers[q.id] !== undefined).length;
  const percent = total ? (done / total) * 100 : 0;
  const complete = done === total && total > 0;

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => {
      const next = { ...prev, [questionId]: value };
      // If drink_gate answer changed from 3 to something else, remove drink_trigger answer
      if (questionId === 'drink_gate_q1' && value !== 3) {
        delete next['drink_gate_q2'];
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!complete) return;
    const drunkTriggered = answers['drink_gate_q2'] === 2;
    const result = computeResult(answers, drunkTriggered);
    onSubmit(result);
  }, [answers, complete, onSubmit]);

  const getQuestionMetaLabel = (q: DisplayQuestion) => {
    if ('special' in q && q.special) return '补充题';
    return '维度已隐藏';
  };

  return (
    <section className="screen active">
      <div className="test-wrap card">
        <div className="topbar">
          <div className="progress">
            <span style={{ width: `${percent}%` }}></span>
          </div>
          <div className="progress-text">{done} / {total}</div>
        </div>

        <div className="question-list">
          {visibleQuestions.map((q, index) => (
            <article key={q.id} className="question">
              <div className="question-meta">
                <div className="badge">第 {index + 1} 题</div>
                <div>{getQuestionMetaLabel(q)}</div>
              </div>
              <div className="question-title">{q.text}</div>
              <div className="options">
                {q.options.map((opt, i) => {
                  const code = ['A', 'B', 'C', 'D'][i] || String(i + 1);
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    <label
                      key={i}
                      className={`option${isSelected ? ' selected' : ''}`}
                      onClick={() => handleAnswer(q.id, opt.value)}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => handleAnswer(q.id, opt.value)}
                      />
                      <div className="option-code">{code}</div>
                      <div>{opt.label}</div>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="hint">
          {complete
            ? '都做完了。现在可以把你的电子魂魄交给结果页审判。'
            : '全选完才会放行。世界已经够乱了，起码把题做完整。'}
        </div>

        <div className="actions-bottom">
          <button className="btn-secondary" onClick={onBackHome}>
            返回首页
          </button>
          <button
            className="btn-primary"
            disabled={!complete}
            onClick={handleSubmit}
          >
            提交并查看结果
          </button>
        </div>
      </div>
    </section>
  );
}
