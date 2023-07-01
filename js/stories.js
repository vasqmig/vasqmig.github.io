"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      <div>
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? getStars(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function getStars(story, user){
  const isFavorite = false //user.isFavorite(story); //find fix or creat method
  const starType = isFavorite ? "fas" : "far";
  return`
  <span class ="star">
  <i class="${starType} fa-star></i>
  </span>`;
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt){
  console.debug("deleteStory");

  const closestLi = $(evt.target).closest("li");
  const storyId = closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);
  await putStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = {title, url, author, username};
  const story = await storyList.addStory(currentUser, storyData)
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

function putFavoritesListOnPage(){
  console.debug("putUserStoriesOnPage");
  $ownStories.empty();

  if (currentUser.ownStories.length === 0){
    $ownStories.append("<h5>Np stories added by user yet!</h5>")
  } else{
    for (let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

function putFavoritesListOnPage(){
  console.debug("putFavoritesListOnPage");

  $favoritedStrories.empty();

  if (currentUser.favorites.length === 0){
    $favoritedStrories.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStrories.append($story);
    }
  }
  $favoritedStrories.show();
}

async function toggleStoryFavorite(evt){
  console.debug("toggleStoryFavorie");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if($tgt.hasClass("fas")){
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesList.on("click", ".star", toggleStoryFavorite);