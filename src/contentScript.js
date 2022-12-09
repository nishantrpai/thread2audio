// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page
const svgPlay = `<svg class="r-4qtqp9 r-yyyyoo r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M8 5v14l11-7z"></path></svg>`;
const svgPause = `<svg class="r-4qtqp9 r-yyyyoo r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;
// @ts-ignore
window.utterances = [];
let windowurl = window.location.href;

const playTweet = (event) => {
  // on click change svg to pause
  let playButton = event.target.closest('[aria-label="Play"]');
  if (playButton.querySelector('svg').outerHTML.includes(svgPlay)) {
    playButton.querySelector('svg').parentElement.innerHTML = svgPause;
    if (window.speechSynthesis.speaking) {
      console.log('resume');
      window.speechSynthesis.resume();
    } else {
      // closest div with data-testid="tweet"
      console.log('playing new tweet');
      let tweetDiv = playButton.parentElement.parentElement.parentElement.parentElement.querySelector('[data-testid="tweetText"]');
      let tweetCtr = tweetDiv.closest('[data-testid="cellInnerDiv"]');
      let tweetAuthor = tweetCtr.querySelector('a').href;
      let tweetText = tweetDiv.innerText;
      let utterance = new SpeechSynthesisUtterance(tweetText);
      // @ts-ignore
      window.utterances.push(utterance);
      window.speechSynthesis.speak(utterance);
      utterance.addEventListener('boundary', (event) => {
        let word = event.charIndex;
        let wordLength = event.charLength;
        let wordStart = word;
        let wordEnd = word + wordLength;
        let tweetText = tweetDiv.innerText;
        let tweetTextBeforeWord = tweetText.slice(0, wordStart);
        let tweetTextWord = tweetText.slice(wordStart, wordEnd);
        let tweetTextAfterWord = tweetText.slice(wordEnd);
        // scroll to tweetDiv 
        window.scrollTo({
          behavior: 'smooth',
          top: tweetDiv.getBoundingClientRect().top + window.scrollY - 100,
        });
        tweetDiv.innerHTML = `${tweetTextBeforeWord}<span style="background-color: #38bdf8;color: white;border: 3px solid #0c4a6e;border-radius: 5px;">${tweetTextWord}</span>${tweetTextAfterWord}`;
      });


      // @ts-ignore
      utterance.addEventListener('end', (event) => {
        console.log('end event');
        tweetDiv.innerHTML = tweetText;
        playButton.querySelector('svg').parentElement.innerHTML = svgPlay;
        // thread
        if (tweetCtr.nextElementSibling?.querySelector('[aria-label="Play"]')) {
          if (tweetAuthor == tweetCtr?.nextElementSibling?.querySelector('a')?.href) {
            tweetCtr.nextElementSibling.querySelector('[aria-label="Play"]').click();
          }
        } else {
          if (tweetAuthor == tweetCtr?.nextElementSibling?.nextElementSibling?.querySelector('a')?.href) {
            tweetCtr.nextElementSibling.nextElementSibling.querySelector('[aria-label="Play"]').click();
          }
        }
      });


    }
  } else {
    console.log('pausing tweet');
    window.speechSynthesis.pause();
    playButton.querySelector('svg').parentElement.innerHTML = svgPlay;
  }
};

// on div click remove all utterances
const stopAll = () => {
  console.log('stop all');
  window.speechSynthesis.cancel();
  let playButtons = document.querySelectorAll('[aria-label="Play"]');
  // remove all utterances
  // @ts-ignore
  playButtons.forEach((playButton) => {
    // @ts-ignore
    playButton.querySelector('svg').parentElement.innerHTML = svgPlay;
  });
};

const main = () => {
  // white svg for play

  const buttonContainer = `<div class="css-1dbjc4n r-18u37iz r-1h0z5md"><div aria-label="Play" role="button" tabindex="0" class="css-18t94o4 css-1dbjc4n r-1777fci r-bt1l66 r-1ny4l3l r-bztko3 r-lrvibr" data-testid="like"><div dir="ltr" class="css-901oao r-1awozwy r-1bwzh9t r-6koalj r-37j5jr r-a023e6 r-16dba41 r-1h0z5md r-rjixqe r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0"><div class="css-1dbjc4n r-xoduu5"><div class="css-1dbjc4n r-1niwhzg r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-1ny4l3l r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"></div>${svgPlay}</div></div></div></div>`

  // add event listener for buttonContainer on click playTweet

  // svg for pause

  // query selector using aria label
  const replyButtons = document.querySelectorAll('[data-testid="retweet"]'); //data-testid="retweet" for all retweet buttons
  // get parent or parent for each replyButton
  const replyButtonParents = Array.from(replyButtons).map((button) => button.parentElement?.parentElement);

  // filter from all replyButtonParents the ones that don't button with aria label "Play"
  const replyButtonParentsToBeReplaced = replyButtonParents.filter((parent) => parent?.querySelector('[aria-label="Play"]') === null);

  // add play button to each parent
  replyButtonParentsToBeReplaced.forEach((parent) => {
    parent?.insertAdjacentHTML('beforeend', buttonContainer);
  });

  // add event listener for each play button
  const playButtons = Array.from(document.querySelectorAll('[aria-label="Play"]'));
  playButtons.forEach((button) => {
    button.addEventListener('click', playTweet);
  });
};

const checkMutations = () => {
  // @ts-ignore
  let observer = new MutationObserver(function (mutations, observer) {
    main();
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true
  });
};

checkMutations();
main();

// window dom loaded
window.addEventListener('DOMContentLoaded', () => {
  // add stop all button
  stopAll();
});

// on route change
window.addEventListener('popstate', () => {
  stopAll();
});

window.addEventListener(
  "click",
  () => {
    requestAnimationFrame(async (event) => {
      if (windowurl !== window.location.href) {
        stopAll();
        windowurl = window.location.href;
      }
    });
  },
  true
);