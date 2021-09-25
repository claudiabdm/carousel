import './styles/styles.scss';
import { Carousel } from './carousel';


const images = {
  list: createImagesList(20, 400, 300),
};
const thumbnails = {
  list: createImagesList(20, 50, 50),
};

const images2 = {
  list: createImagesList(10, 200, 100),
};
const thumbnails2 = {
  list: createImagesList(10, 40, 40),
};

const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.href = images.list[0].url;
preloadLink.as = 'image';
document.head.appendChild(preloadLink);

const wrapper = document.querySelector('#car1');
new Carousel(wrapper, images, thumbnails);

const wrapper2 = document.querySelector('#car2');
new Carousel(wrapper2, images2, thumbnails2);

function createImagesList(length, width, height) {
  return Array.from(Array(length)).map((elem, idx) => ({
    id: idx,
    url: `https://picsum.photos/id/${idx}/${width}/${height}`,
    alt: 'Alt text',
    width,
    height,
  }));
}
