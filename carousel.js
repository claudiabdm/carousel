'use strict';
import sprite from './sprite.svg';
export { Carousel };

function Carousel(wrapper, slides, thumbnails) {
  this.currentIdx = 0;
  this.wrapper = wrapper;
  this.slides = slides;
  this.thumbnails = thumbnails;
  this.slidesUl = null;
  this.thumbnailsUl = null;
  this.prevButton = null;
  this.nextButton = null;
  this._render();
}

Carousel.prototype._render = function () {
  createCarousel.call(this, this.slides, this.thumbnails);
  addEvents.call(this);
};

function createCarousel(slides, thumbnails) {
  const carouselFragment = document.createDocumentFragment();

  carouselFragment.appendChild(createCarouselMain.call(this, slides));
  carouselFragment.appendChild(createCarouselThumbnails.call(this, thumbnails));
  this.wrapper.appendChild(carouselFragment);

  function createCarouselMain(slides) {
    const carouselMain = document.createElement('div');
    const carouselMainFragment = document.createDocumentFragment();

    this.slidesUl = createList({ list: slides.list, type: 'main' });

    this.prevButton = createButton({
      id: 'prevButton',
      icon: 'prev',
      ariaLabel: 'Go to previous photo',
    });

    this.nextButton = createButton({
      id: 'nextButton',
      icon: 'next',
      ariaLabel: 'Go to next photo',
    });

    carouselMainFragment.appendChild(this.prevButton);
    carouselMainFragment.appendChild(this.slidesUl);
    carouselMainFragment.appendChild(this.nextButton);

    carouselMain.appendChild(carouselMainFragment);
    carouselMain.classList.add('carousel__main');
    return carouselMain;
  }

  function createCarouselThumbnails(thumbnails) {
    const carouselThumbnail = document.createElement('div');
    this.thumbnailsUl = createList({
      list: thumbnails.list,
      type: 'thumbnail',
      className: 'carousel__slides--thumbnails',
    });
    carouselThumbnail.appendChild(this.thumbnailsUl);
    carouselThumbnail.classList.add('carousel__thumbnails');
    return carouselThumbnail;
  }

  function createList({ list, type, className }) {
    const ul = document.createElement('ul');
    const arrFragment = document.createDocumentFragment();
    const classes = className
      ? ['carousel__slides', className]
      : ['carousel__slides'];
    for (let i = 0; i < list.length; i++) {
      arrFragment.appendChild(createLiElem({ imgObj: list[i], type }));
    }
    ul.appendChild(arrFragment);
    ul.classList.add(...classes);
    return ul;
  }

  function createLiElem({ imgObj, type }) {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const classesLi = `carousel__slide carousel__slide--${type}`;
    const classesImg = 'carousel__img';
    const shouldLoadFirst =
      type == 'thumbnail' ||
      (type == 'main' && (imgObj.id < 2 || imgObj.id > slides.list.length - 2));

    li.className = classesLi;
    img.className = classesImg;
    if (type == 'thumbnail') img.tabIndex = '0';

    if (imgObj.id === 0) {
      li.classList.add('carousel__slide--visible');
    }
    img.dataset.imgid = imgObj.id;
    img.dataset.src = !shouldLoadFirst ? imgObj.url : '';
    img.alt = imgObj.alt;
    img.src = shouldLoadFirst
      ? imgObj.url
      : `https://via.placeholder.com/${imgObj.width}x${imgObj.height}/FFFFFF/FFFFFF`;
    img.width = imgObj.width;
    img.height = imgObj.height;
    li.appendChild(img);
    return li;
  }

  function createButton({ type, ariaLabel, id, icon }) {
    const button = document.createElement('button');
    button.classList.add('carousel__button');
    button.type = type || 'button';
    button.ariaLabel = ariaLabel;
    button.id = id;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('carousel__arrow');
    const useSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'use'
    );
    useSvg.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      `${sprite}#${icon}`
    );
    svg.appendChild(useSvg);
    button.appendChild(svg);
    return button;
  }
}

function addEvents() {
  this.prevButton.addEventListener('click', goToPrev(this));
  this.nextButton.addEventListener('click', goToNext(this));
  this.thumbnailsUl.addEventListener('click', selectThumbnail(this));
  this.thumbnailsUl.addEventListener('mouseover', imagePreload(this));
  this.thumbnailsUl.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      selectThumbnail(this)(e);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key == 'ArrowRight') {
      goToNext(this)(e);
    }
    if (e.key == 'ArrowLeft') {
      goToPrev(this)(e);
    }
  });

  function selectThumbnail(thisCarousel) {
    return function handleSelectedThumbnail(e) {
      const newIdx = Array.from(thisCarousel.slidesUl.children).findIndex(
        (child) =>
          child.firstElementChild.dataset.imgid === e.target.dataset.imgid
      );
      if (newIdx > -1 && newIdx !== thisCarousel.currentIdx) {
        loadPrevAndNextImages.call(thisCarousel, newIdx - 1, newIdx + 1);
        changeCurrentSlide.call(thisCarousel, thisCarousel.currentIdx, newIdx);
        thisCarousel.currentIdx = newIdx;
      }
    };
  }

  function imagePreload(thisCarousel) {
    return function handleHoverImagePreload(e) {
      const newIdx = Array.from(thisCarousel.slidesUl.children).findIndex(
        (child) =>
          child.firstElementChild.dataset.imgid === e.target.dataset.imgid
      );
      if (newIdx > -1 && newIdx !== thisCarousel.currentIdx) {
        loadImage(thisCarousel.slidesUl.children[newIdx]?.firstElementChild);
        loadPrevAndNextImages.bind(thisCarousel, newIdx - 1, newIdx + 1);
      }
    };
  }

  function goToNext(thisCarousel) {
    return function handleNext(e) {
      if (thisCarousel.currentIdx < thisCarousel.slidesUl.children.length - 1) {
        changeCurrentSlide.call(
          thisCarousel,
          thisCarousel.currentIdx,
          thisCarousel.currentIdx + 1
        );
        thisCarousel.currentIdx += 1;
      } else {
        changeCurrentSlide.call(thisCarousel, thisCarousel.currentIdx, 0);
        thisCarousel.currentIdx = 0;
      }
    };
  }

  function goToPrev(thisCarousel) {
    return function handlePrev(e) {
      if (thisCarousel.currentIdx > 0) {
        changeCurrentSlide.call(
          thisCarousel,
          thisCarousel.currentIdx,
          thisCarousel.currentIdx - 1
        );
        thisCarousel.currentIdx -= 1;
      } else {
        changeCurrentSlide.call(
          thisCarousel,
          thisCarousel.currentIdx,
          thisCarousel.slidesUl.children.length - 1
        );
        thisCarousel.currentIdx = thisCarousel.slidesUl.children.length - 1;
      }
    };
  }

  function changeCurrentSlide(oldIdx, newIdx) {
    loadImage(this.slidesUl.children[newIdx]?.firstElementChild);

    if (newIdx < this.slidesUl.children.length - 1 && oldIdx < newIdx) {
      loadImage(this.slidesUl.children[newIdx + 1]?.firstElementChild);
    } else {
      loadImage(this.slidesUl.children[newIdx - 1]?.firstElementChild);
    }

    this.slidesUl.children[newIdx].classList.add('carousel__slide--visible');
    this.thumbnailsUl.children[newIdx].classList.add(
      'carousel__slide--visible'
    );

    this.slidesUl.children[oldIdx].classList.remove('carousel__slide--visible');
    this.thumbnailsUl.children[oldIdx].classList.remove(
      'carousel__slide--visible'
    );
  }

  function loadPrevAndNextImages(prevIdx, nextIdx) {
    loadImage(this.slidesUl.children[prevIdx]?.firstElementChild);
    loadImage(this.slidesUl.children[nextIdx]?.firstElementChild);
  }
}

function loadImage(img) {
  if (img && (!img.src || img.src.includes('placeholder'))) {
    img.src = img.dataset.src;
  }
}
