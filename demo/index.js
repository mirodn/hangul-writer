// jamo offered as suggestions; any syllable (가–힣) can be typed in as well
var JAMO = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㄲㄸㅃㅆㅉㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ';

var writer;
var isCharVisible;
var isOutlineVisible;

function setFeedback(message) {
  document.querySelector('.js-feedback').textContent = message;
}

function currentCharacter() {
  return document.querySelector('.js-char').value;
}

function startQuiz() {
  var character = currentCharacter();
  setFeedback('Draw ' + character + ' stroke by stroke.');
  writer.quiz({
    showOutline: true,
    onCorrectStroke: function (strokeData) {
      setFeedback(
        'Stroke ' + (strokeData.strokeNum + 1) + ' correct! ' +
          strokeData.strokesRemaining + ' to go.',
      );
    },
    onMistake: function (strokeData) {
      setFeedback(
        strokeData.isBackwards
          ? 'Wrong direction. Press Animate to see how stroke ' +
              (strokeData.strokeNum + 1) + ' is drawn.'
          : 'Not quite. Try stroke ' + (strokeData.strokeNum + 1) + ' again (' +
              strokeData.mistakesOnStroke + ' mistake(s)).',
      );
    },
    onComplete: function (summary) {
      setFeedback(
        'Done! ' + summary.character + ' completed with ' + summary.totalMistakes + ' mistake(s).',
      );
    },
  });
}

function updateCharacter() {
  document.querySelector('#target').innerHTML = '';
  var character = currentCharacter();
  window.location.hash = character;
  writer = HangulWriter.create('target', character, {
    width: 400,
    height: 400,
    showCharacter: false,
    onLoadCharDataError: function () {
      setFeedback('"' + character + '" is not supported. Enter a Hangul jamo or syllable (가–힣).');
    },
  });
  isCharVisible = false;
  isOutlineVisible = true;
  window.writer = writer;
  startQuiz();
}

window.onload = function () {
  var suggestions = document.querySelector('#hangul-jamo');
  Array.from(JAMO).forEach(function (character) {
    suggestions.appendChild(new Option(character));
  });
  var requested = decodeURIComponent(window.location.hash.slice(1));
  if (requested) {
    document.querySelector('.js-char').value = requested;
  }

  updateCharacter();

  document.querySelector('.js-char-form').addEventListener('submit', function (evt) {
    evt.preventDefault();
    updateCharacter();
  });
  document.querySelector('.js-toggle').addEventListener('click', function () {
    isCharVisible ? writer.hideCharacter() : writer.showCharacter();
    isCharVisible = !isCharVisible;
  });
  document.querySelector('.js-toggle-hint').addEventListener('click', function () {
    isOutlineVisible ? writer.hideOutline() : writer.showOutline();
    isOutlineVisible = !isOutlineVisible;
  });
  document.querySelector('.js-animate').addEventListener('click', function () {
    setFeedback('');
    writer.animateCharacter();
  });
  document.querySelector('.js-quiz').addEventListener('click', startQuiz);
};
