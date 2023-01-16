import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import {
  getAiringTodayShows,
  IAirTodayShowResult,
  getPopularShows,
  getTopRatedShows,
  ITopRatedShowResult,
  IPopularShowResult,
  getOnTheAirShows,
  IOnTheAir,
} from "../api";
import { clickedTvState } from "../atoms";
import Slider from "../Components/MovieSlider";
import { makeImagePath } from "../utilities";

const Wrapper = styled.div`
  height: 250vh;
  background-color: ${(props) => props.theme.black.veryDark};
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  padding: 60px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0),
      ${(props) => props.theme.black.veryDark}
    ),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 30px;
`;

const Overview = styled.p`
  font-size: 36px;
  width: 50%;
`;

const Sliders = styled.div`
  box-sizing: border-box;
  margin: 3vw 0;
  position: relative;
  top: -130px;
  display: flex;
  flex-direction: column;
  gap: 12vw;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  border-radius: 5px;
  width: 70vw;
  height: 95vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.darker};
`;

// img tag가 아닌 div tag를 이용하여 backgourndImage를 넣어주는 방법으로 사진이 찌그러지는 것을 막음.
const BigCover = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  padding: 20px;
  color: ${(props) => props.theme.white.lighter};
`;

function Tv() {
  const navigate = useNavigate();
  const bigVideoMatch = useMatch("/tv/:showId");
  // const clickedVideoId = bigVideoMatch ? +bigVideoMatch.params.showId! : null;

  const { scrollY } = useScroll();

  const [clickedTv] = useRecoilState(clickedTvState);

  const { data: airTodayData, isLoading: airTodayLoading } =
    useQuery<IAirTodayShowResult>(["shows", "airToday"], getAiringTodayShows);

  const { data: onTheAirData, isLoading: onTheAirLoading } =
    useQuery<IOnTheAir>(["shows", "onTheAir"], getOnTheAirShows);

  const { data: popularData, isLoading: popularLoading } =
    useQuery<IPopularShowResult>(["movies", "popular"], getPopularShows);

  const { data: topRatedData, isLoading: topRatedLoading } =
    useQuery<ITopRatedShowResult>(["movies", "upcoming"], getTopRatedShows);

  const onOverlayClick = () => navigate(-1);

  return (
    <Wrapper>
      {airTodayLoading ||
      onTheAirLoading ||
      popularLoading ||
      topRatedLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              airTodayData?.results[0].backdrop_path || ""
            )}
          >
            <Title>{airTodayData?.results[0].name}</Title>
            <Overview>{airTodayData?.results[0].overview}</Overview>
          </Banner>
          <Sliders>
            <Slider
              title="AIRING TODAY"
              sliderId="airing-today"
              mediaType="tv"
              contents={airTodayData ? airTodayData?.results.slice(1) : []}
            ></Slider>
            <Slider
              title="POPULAR"
              sliderId="popular"
              mediaType="tv"
              contents={popularData ? popularData?.results : []}
            ></Slider>
            <Slider
              title="TOP RATED"
              sliderId="top-rated"
              mediaType="tv"
              contents={topRatedData ? topRatedData?.results : []}
            ></Slider>
            <Slider
              title="ON THE AIR"
              sliderId="on-the-air"
              mediaType="tv"
              contents={onTheAirData ? onTheAirData?.results : []}
            ></Slider>
          </Sliders>
          <AnimatePresence>
            {bigVideoMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></Overlay>
                <BigMovie
                  style={{ top: scrollY.get() + 30 }}
                  layoutId={bigVideoMatch?.params + ""}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top,#181818 , transparent), url(${makeImagePath(
                            clickedTv.backdrop_path!
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
