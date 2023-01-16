import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { IMovie } from "../api";
import {
  clickedMovieState,
  clickedSearchState,
  clickedTvState,
} from "../atoms";
import { makeImagePath } from "../utilities";

const RowContainer = styled.div``;

const RowTitle = styled.h2`
  margin-left: 20px;
  padding: 5px 10px;
  font-size: 24px;
  font-weight: 600;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  position: absolute;
  width: 100%;
`;

// motion.div 등 motion을 사용할 때는 뒤에다가 prop을 정의해줌!!!
const Box = styled(motion.div)<{ bgphoto: string }>`
  border-radius: 3px;
  background-color: white;
  background-image: url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  aspect-ratio: 16/9;
  width: 100%;
  height: auto;
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  position: absolute;
  padding: 10px;
  width: 100%;
  opacity: 0;
  background-color: ${(props) => props.theme.black.lighter};
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Buttons = styled(motion.div)`
  padding: 0 1vw;
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 20%;
`;

const Button = styled(motion.button)`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  height: 100%;
  background-color: transparent;
  font-size: 40px;
  font-weight: 600px;
  color: white;
  cursor: pointer;
  z-index: 1;
`;

const RowVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
  animate: { x: 0 },
  exit: (direction: number) => ({
    x: direction < 0 ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
};

const BoxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.5,
    y: -100,
    transition: { delay: 0.3, type: "tween", duration: 0.3 },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: { delay: 0.3, type: "tween", duration: 0.3 },
  },
};

interface ISliderProps {
  title: string;
  sliderId: string;
  mediaType: string;
  contents: IMovie[];
}

const offset = 6;

function Slider({ title, sliderId, mediaType, contents }: ISliderProps) {
  // const width = useWindowDimensions();
  const navigate = useNavigate();

  const setClickedMovie = useSetRecoilState(clickedMovieState);
  const setClickedTv = useSetRecoilState(clickedTvState);
  const setClickedSearch = useSetRecoilState(clickedSearchState);

  const [index, setIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [leaving, setLeaving] = useState(false);
  const increaseIndex = (newDirection: number) => {
    if (contents) {
      if (leaving) return;
      toggleLeaving();
      setPage([page + newDirection, newDirection]);
      const totalMovies = contents.length;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movie: IMovie, movieId: number) => {
    if (mediaType === "movie") {
      setClickedMovie(movie);
      navigate(`/movies/${movieId}`);
    } else if (mediaType === "tv") {
      setClickedTv(movie);
      navigate(`/tv/${movieId}`);
    } else {
      setClickedSearch(movie);
      navigate(`/search/${movieId}`);
    }
  };

  return (
    <RowContainer>
      <RowTitle>{title}</RowTitle>
      <Buttons>
        <Button whileHover={{ scale: 1.3 }} onClick={() => increaseIndex(-1)}>
          〈
        </Button>
        <Button whileHover={{ scale: 1.3 }} onClick={() => increaseIndex(1)}>
          〉
        </Button>
      </Buttons>
      <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
        <Row
          variants={RowVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
          transition={{ type: "tween", duration: 1 }}
          key={page}
        >
          {contents
            .slice(offset * index, offset * index + offset)
            .map((movie) => (
              <Box
                layoutId={sliderId + movie.id + ""}
                key={movie.id}
                onClick={() => onBoxClicked(movie, movie.id)}
                variants={BoxVariants}
                initial="normal"
                whileHover="hover"
                transition={{ type: "tween" }}
                bgphoto={makeImagePath(movie.backdrop_path!, "w500")}
              >
                <Info variants={infoVariants}>
                  <h4>{movie.title}</h4>
                </Info>
              </Box>
            ))}
        </Row>
      </AnimatePresence>
    </RowContainer>
  );
}

export default Slider;
