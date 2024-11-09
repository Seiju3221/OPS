import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

import Img1 from "../../assets/hero-carousel/Img1.jpg";
import Img2 from "../../assets/hero-carousel/Img2.jpg";
import Img3 from "../../assets/hero-carousel/Img3.jpg";
import Img4 from "../../assets/hero-carousel/Img4.jpg";

import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';

const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row justify-between items-center md:gap-14 gap-8'>
      <div className='md:w-1/2 w-full text-center'>
        <h1 className='md:text-5xl text-3xl font-bold md:leading-tight'>
          Online Publication System
        </h1>
        <p className='py-4'>OPS: Online publication system serves as a digital hub for online publication of articles regarding the University of Northern Philippines. It streamlines the submission, review, and dissemination of school publications and articles. By facilitating the publication process and increasing the visibility of online articles, it contributes to the advancement of knowledge and collaboration within the university.</p>
      </div>
      <div className='md:w-1/2 w-full mx-auto'>
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 1,
              spaceBetween: 50,
            },
          }}
          modules={[Pagination, Autoplay]}
          className="mySwiper"
        >
          <SwiperSlide>
            <img src={Img1} alt='' className='w-full lg:h-[420px] sm:h-96 h-80' />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Img2} alt='' className='w-full lg:h-[420px] sm:h-96 h-80' />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Img3} alt='' className='w-full lg:h-[420px] sm:h-96 h-80' />
          </SwiperSlide>
          <SwiperSlide>
            <img src={Img4} alt='' className='w-full lg:h-[420px] sm:h-96 h-80' />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  )
}

export default Banner
