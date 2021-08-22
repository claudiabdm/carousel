let currentIdx = 0;

const images = {
  list: createImagesList(20, 400, 300)
};
const thumbnails = {
  list: createImagesList(20, 50, 50)
};

const [carouselSlidesUl, carouselThumbnailsUl] = createCarouselContent(
  images,
  thumbnails
);

const carouselSlides = carouselSlidesUl.children;
const carouselThumbnails = carouselThumbnailsUl.children;

addEvents();

function createImagesList(length, width, height) {
  return Array.from(Array(length)).map((elem, idx) => ({
    id: idx,
    url: `https://picsum.photos/id/${idx}/${width}/${height}`,
    alt: "Alt text",
    width,
    height
  }));
}

function createCarouselContent(slides, thumbnails) {
  const slidesUl = document.documentElement.querySelector(".carousel__slides");
  const thumbnailsUl = document.documentElement.querySelector(
    ".carousel__slides--thumbnails"
  );
  const slidesFragment = document.createDocumentFragment();
  const thumbnailsFragment = document.createDocumentFragment();

  for (let i = 0; i < slides.list.length; i++) {
    slidesFragment.appendChild(createSlideLiElem(slides.list[i], "main"));
    thumbnailsFragment.appendChild(
      createSlideLiElem(thumbnails.list[i], "thumbnail")
    );
  }
  slidesUl.appendChild(slidesFragment);
  thumbnailsUl.appendChild(thumbnailsFragment);

  return [slidesUl, thumbnailsUl];

  function createSlideLiElem(imgObj, type) {
    const li = document.createElement("li");
    const img = document.createElement("img");
    const classesLi = `carousel__slide carousel__slide--${type}`;
    const classesImg = "carousel__img";
    const shouldLoadFirst =
      type == "thumbnail" ||
      (type == "main" && (imgObj.id < 2 || imgObj.id > slides.list.length - 2));

    li.className = classesLi;
    img.className = classesImg;
    if (type == "thumbnail") img.tabIndex = '0';

    if (imgObj.id === 0) {
      li.classList.add("carousel__slide--visible");
    }
    img.dataset.imgid = imgObj.id;
    img.dataset.src = !shouldLoadFirst ? imgObj.url : "";
    img.alt = imgObj.alt;
    img.src = shouldLoadFirst
      ? imgObj.url
      : `https://via.placeholder.com/${imgObj.width}x${imgObj.height}/FFFFFF/FFFFFF`;
    img.width = imgObj.width;
    img.height = imgObj.height;
    li.appendChild(img);
    return li;
  }
}

function addEvents() {
  const prevButton = document.documentElement.querySelector("#prevButton");
  const nextButton = document.documentElement.querySelector("#nextButton");

  nextButton.addEventListener("click", handleNext);
  prevButton.addEventListener("click", handlePrev);

  carouselThumbnailsUl.addEventListener("click", handleSelectedThumbnail);
  carouselThumbnailsUl.addEventListener("mouseover", handleHoverImagePreload);
  carouselThumbnailsUl.addEventListener("keydown", (e) => {
    if (e.key == 'Enter') {
      handleSelectedThumbnail(e);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowRight") {
      handleNext();
    }
    if (e.key == "ArrowLeft") {
      handlePrev();
    }
  });

  function handleNext() {
    if (currentIdx < carouselSlides.length - 1) {
      changeCurrentSlide(currentIdx, currentIdx + 1);
      currentIdx += 1;
    } else {
      changeCurrentSlide(currentIdx, 0);
      currentIdx = 0;
    }
  }

  function handlePrev() {
    if (currentIdx > 0) {
      changeCurrentSlide(currentIdx, currentIdx - 1);
      currentIdx -= 1;
    } else {
      changeCurrentSlide(currentIdx, carouselSlides.length - 1);
      currentIdx = carouselSlides.length - 1;
    }
  }

  function handleSelectedThumbnail(e) {
    const newIdx = Array.from(carouselSlides).findIndex(
      (child) => child.firstElementChild.dataset.imgid === e.target.dataset.imgid
    );
    if (newIdx > -1 && newIdx !== currentIdx) {
      loadPrevAndNextImages(newIdx - 1, newIdx + 1);
      changeCurrentSlide(currentIdx, newIdx);
      currentIdx = newIdx;
    }
  }

  function handleHoverImagePreload(e) {
    const newIdx = Array.from(carouselSlides).findIndex(
      (child) => child.firstElementChild.dataset.imgid === e.target.dataset.imgid
    );
    if (newIdx > -1 && newIdx !== currentIdx) {
      loadImage(carouselSlides[newIdx]?.firstElementChild);
      loadPrevAndNextImages(newIdx - 1, newIdx + 1);
    }
  }
}

function changeCurrentSlide(oldIdx, newIdx) {
  loadImage(carouselSlides[newIdx]?.firstElementChild);

  if (newIdx < carouselSlides.length - 1 && oldIdx < newIdx) {
    loadImage(carouselSlides[newIdx + 1]?.firstElementChild);
  } else {
    loadImage(carouselSlides[newIdx - 1]?.firstElementChild);
  }

  carouselSlides[newIdx].classList.add("carousel__slide--visible");
  carouselThumbnails[newIdx].classList.add("carousel__slide--visible");

  carouselSlides[oldIdx].classList.remove("carousel__slide--visible");
  carouselThumbnails[oldIdx].classList.remove("carousel__slide--visible");
}

function loadPrevAndNextImages(prevIdx, nextIdx) {
  loadImage(carouselSlides[prevIdx]?.firstElementChild);
  loadImage(carouselSlides[nextIdx]?.firstElementChild);
}

function loadImage(img) {
  if (img && (!img.src || img.src.includes("placeholder"))) {
    img.src = img.dataset.src;
  }
}
