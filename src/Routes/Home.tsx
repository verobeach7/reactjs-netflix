import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import {
  getNowPlayingMovies,
  getTopRatedMovies,
  INowPlayingMoviesResult,
  IMoviesResult,
  getPopularMovies,
  getUpcomingMovies,
  IMovieDetail,
  getMovieDetail,
  ISimilarMovies,
  getSimilarMovies,
} from "../api";
import { clickedMovieState } from "../atoms";
import Slider from "../Components/MovieSlider";
import { makeImagePath } from "../utilities";

export const Wrapper = styled.div`
  height: 20vh;
  background-color: ${(props) => props.theme.black.veryDark};
`;

export const Loader = styled.div`
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

export const Sliders = styled.div`
  box-sizing: border-box;
  margin: 3vw 0;
  position: relative;
  top: -130px;
  display: flex;
  flex-direction: column;
  gap: 12vw;
`;

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

export const BigMovie = styled(motion.div)`
  position: absolute;
  border-radius: 5px;
  width: 70vw;
  height: 95vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.darker};
  overflow-y: overlay;

  &::-webkit-scrollbar {
    width: 0.8rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 0.4rem;
    background-clip: padding-box;
    border: 0.3rem solid transparent;
  }
`;

// img tag가 아닌 div tag를 이용하여 backgourndImage를 넣어주는 방법으로 사진이 찌그러지는 것을 막음.
export const BigCover = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center center;
`;

export const DetailContainer = styled.div`
  position: relative;
  top: -80px;
  margin: 0 30px;
`;

export const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 0 20px;
  font-size: 46px;
  font-weight: 800;
  position: relative;
  top: -80px;
  text-align: center;
`;

export const InfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const MainInfo = styled.div``;

export const Release = styled.p`
  margin: 0 20px 20px;
  padding: 0 10px;
  font-size: 1.6vw;
  font-weight: 400;
  span {
    margin: 0 7px;
    border-radius: 3px;
    padding: 3px 15px;
    background-color: ${(props) => props.theme.white.darker};
    color: ${(props) => props.theme.black.lighter};
  }
`;

export const BigOverview = styled.p`
  width: 100%;
  padding: 0 20px;
  font-size: 1.4vw;
  font-weight: 400;
  text-align: justify;
  color: ${(props) => props.theme.white.lighter};
`;

export const SubInfo = styled.div`
  padding: 0 20px;
`;

export const VoteContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const VoteAverage = styled.div`
  font-size: 1.2vw;
  font-weight: 400;
`;

export const VoteCount = styled.div`
  font-size: 1.2vw;
  font-weight: 400;
`;

export const Genres = styled.ul`
  margin: 30px 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

export const Genre = styled.li`
  padding: 3px 10px;
  border-radius: 5px;
  background-color: red;
  font-size: 1vw;
  font-weight: 400;
  display: flex;
  align-items: center;
  span {
    width: 100%;
    text-align: center;
  }
`;

export const SimilarVideos = styled.div`
  margin-top: 30px;
`;

export const SimilarTitle = styled.div`
  margin: 40px 20px 10px;
  font-size: 36px;
  font-weight: 400;
`;

export const SimilarWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
`;

export const Box = styled(motion.div)<{ bgphoto: string }>`
  border-radius: 3px;
  height: 100px;
  background-color: white;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
  font-size: 1.5vw;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  span {
    margin-bottom: 10px;
  }
`;

function Home() {
  const navigate = useNavigate();
  const bigVideoMatch = useMatch("/movies/:movieId");
  // console.log(bigVideoMatch?.params.movieId);
  const clickedVideoId = bigVideoMatch ? +bigVideoMatch.params.movieId! : null;
  console.log(clickedVideoId);
  const { scrollY } = useScroll();

  const [clickedMovie] = useRecoilState(clickedMovieState);

  const { data: nowPlayingData, isLoading: nowPlayingLoading } =
    useQuery<INowPlayingMoviesResult>(
      ["movies", "nowPlaying"],
      getNowPlayingMovies
    );
  // console.log(nowPlayingData);

  const { data: topRatedData, isLoading: topRatedLoading } =
    useQuery<IMoviesResult>(["movies", "topRated"], getTopRatedMovies);

  const { data: popularData, isLoading: popularLoading } =
    useQuery<IMoviesResult>(["movies", "popular"], getPopularMovies);

  const { data: upcomingData, isLoading: upcomingLoading } =
    useQuery<IMoviesResult>(["movies", "upcoming"], getUpcomingMovies);
  console.log("up", upcomingData);
  const { data: movieDetail, isLoading: movieDetailLoading } =
    useQuery<IMovieDetail>(["movie-detail", clickedVideoId], () =>
      getMovieDetail(clickedVideoId!)
    );
  console.log("detail", movieDetail);

  const { data: similarMovies, isLoading: similarMovieLoading } =
    useQuery<ISimilarMovies>(["similar-movies", clickedVideoId], () =>
      getSimilarMovies(clickedVideoId!)
    );
  console.log("similar", similarMovies);

  const onOverlayClick = () => navigate(-1);
  // api data 중에서 클릭한 영상의 data만 추출

  return (
    <Wrapper>
      {nowPlayingLoading ||
      topRatedLoading ||
      popularLoading ||
      upcomingLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(
              nowPlayingData?.results[0].backdrop_path || ""
            )}
          >
            <Title>{nowPlayingData?.results[0].title}</Title>
            <Overview>{nowPlayingData?.results[0].overview}</Overview>
          </Banner>
          <Sliders>
            <Slider
              title="NOW PLAYING"
              sliderId="now-playing"
              mediaType="movie"
              contents={nowPlayingData ? nowPlayingData?.results.slice(1) : []}
            ></Slider>
            <Slider
              title="TOP RATED"
              sliderId="top-rated"
              mediaType="movie"
              contents={topRatedData ? topRatedData?.results : []}
            ></Slider>
            <Slider
              title="POPULAR"
              sliderId="popular"
              mediaType="movie"
              contents={popularData ? popularData?.results : []}
            ></Slider>
            <Slider
              title="UPCOMING"
              sliderId="upcoming"
              mediaType="movie"
              contents={upcomingData ? upcomingData?.results : []}
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
                  layoutId={bigVideoMatch?.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top,#181818 , transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path!
                          )})`,
                        }}
                      />
                      <DetailContainer>
                        <BigTitle>{clickedMovie.title}</BigTitle>
                        <InfoWrapper>
                          <MainInfo>
                            <Release>
                              <span>
                                {movieDetail?.release_date
                                  .toString()
                                  .substring(0, 4)}
                              </span>
                              <span>
                                {movieDetail?.runtime
                                  ? Math.floor(movieDetail?.runtime / 60)
                                  : null}
                                h
                                {movieDetail?.runtime
                                  ? Math.floor(movieDetail?.runtime % 60)
                                  : null}
                                m
                              </span>
                            </Release>
                            <BigOverview>{clickedMovie.overview}</BigOverview>
                          </MainInfo>
                          <SubInfo>
                            <VoteContainer>
                              <VoteAverage>
                                Rates:&nbsp;
                                {movieDetail?.vote_average.toFixed(1)} / 10
                              </VoteAverage>
                              <VoteCount>
                                Votes: {movieDetail?.vote_count}
                              </VoteCount>
                            </VoteContainer>
                            <Genres>
                              {movieDetail?.genres &&
                                movieDetail.genres.map((genre) => (
                                  <Genre key={genre.id}>
                                    <span>{genre.name}</span>
                                  </Genre>
                                ))}
                            </Genres>
                          </SubInfo>
                        </InfoWrapper>
                        <SimilarVideos>
                          <SimilarTitle>Similar Movies</SimilarTitle>
                          <SimilarWrapper>
                            {similarMovies?.results.map((movie) => (
                              <Box
                                key={movie.id}
                                bgphoto={makeImagePath(
                                  movie.backdrop_path!,
                                  "w500"
                                )}
                              >
                                <span>{movie.title}</span>
                              </Box>
                            ))}
                          </SimilarWrapper>
                        </SimilarVideos>
                      </DetailContainer>
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

export default Home;
