import { Box, Button, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import type { MovieSummary } from '../../api/types';
import { MovieCard } from './MovieCard';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  movies?: MovieSummary[];
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  hideWhenEmpty?: boolean;
  hideWhenError?: boolean;
  action?: ReactNode;
  onRetry?: () => void;
  removalPlaylist?: { id: string; name: string };
}

export function MovieRail({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  isError = false,
  emptyLabel = 'Nothing to show yet.',
  hideWhenEmpty = true,
  hideWhenError = true,
  action,
  onRetry,
  removalPlaylist,
}: MovieRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ pointerId: -1, startX: 0, startScroll: 0, lastX: 0, lastTime: 0, velocity: 0, target: 0, moved: false });
  const animationFrame = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const move = (direction: -1 | 1) => railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * .82, behavior: 'smooth' });

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || isLoading || isError || movies.length === 0) {
      setHasOverflow(false);
      return;
    }

    const updateOverflow = () => setHasOverflow(rail.scrollWidth > rail.clientWidth + 1);
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [isError, isLoading, movies.length]);

  const stopAnimation = () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
  };

  const animateTo = (target: number, onComplete?: () => void) => {
    const rail = railRef.current;
    if (!rail) return;
    stopAnimation();
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const destination = Math.min(maxScroll, Math.max(0, target));
    const tick = () => {
      const currentRail = railRef.current;
      if (!currentRail) return;
      const remaining = destination - currentRail.scrollLeft;
      if (Math.abs(remaining) < .65) {
        currentRail.scrollLeft = destination;
        animationFrame.current = null;
        onComplete?.();
        return;
      }
      currentRail.scrollLeft += remaining * .18;
      animationFrame.current = requestAnimationFrame(tick);
    };
    animationFrame.current = requestAnimationFrame(tick);
  };

  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const rail = railRef.current;
    if (!rail) return;
    stopAnimation();
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: rail.scrollLeft, lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, target: rail.scrollLeft, moved: false };
  };

  const continueDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const state = dragState.current;
    if (!rail || state.pointerId !== event.pointerId) return;
    const distance = event.clientX - state.startX;
    if (Math.abs(distance) > 5) {
      if (!state.moved) rail.setPointerCapture(event.pointerId);
      state.moved = true;
      setDragging(true);
      const elapsed = Math.max(8, event.timeStamp - state.lastTime);
      const instantaneousVelocity = -(event.clientX - state.lastX) / elapsed;
      state.velocity = state.velocity * .65 + instantaneousVelocity * .35;
      state.lastX = event.clientX;
      state.lastTime = event.timeStamp;
      state.target = state.startScroll - distance;
      const next = rail.scrollLeft + (state.target - rail.scrollLeft) * .42;
      rail.scrollLeft = next;
      event.preventDefault();
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const state = dragState.current;
    if (!rail || state.pointerId !== event.pointerId) return;
    suppressClick.current = state.moved;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    dragState.current.pointerId = -1;
    setDragging(false);
    if (state.moved) {
      const momentum = Math.max(-1.6, Math.min(1.6, state.velocity)) * 260;
      animateTo(state.target + momentum);
    }
  };

  const interceptDraggedClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  if (!isLoading && ((hideWhenEmpty && movies.length === 0) || (hideWhenError && isError))) return null;

  return (
    <Box component="section" sx={{ mb: { xs: 4, md: 6 }, contentVisibility: 'auto', containIntrinsicSize: '680px' }}>
      <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2">{title}</Typography>
          {subtitle && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.4 }}>{subtitle}</Typography>}
        </Box>
        <Stack direction="row" alignItems="center" spacing={.5}>
          {action}
          {!isLoading && movies.length >= 5 && hasOverflow && (
            <>
              <Tooltip title="Scroll left"><IconButton size="small" aria-label={`Scroll ${title} left`} onClick={() => move(-1)} sx={{ width: 30, height: 30, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}><ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
              <Tooltip title="Scroll right"><IconButton size="small" aria-label={`Scroll ${title} right`} onClick={() => move(1)} sx={{ width: 30, height: 30, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}><ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
            </>
          )}
        </Stack>
      </Stack>

      {isLoading ? (
        <Box className="poster-rail" aria-label={`Loading ${title}`}>
          {Array.from({ length: 8 }, (_, index) => (
            <Box key={index}>
              <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '2 / 3' }} />
              <Skeleton width="82%" sx={{ mt: 1 }} />
              <Skeleton width="42%" />
            </Box>
          ))}
        </Box>
      ) : isError ? (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 90, px: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography color="text.secondary">This row could not be loaded.</Typography>
          {onRetry && <Button size="small" onClick={onRetry}>Try again</Button>}
        </Stack>
      ) : movies.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3 }}>{emptyLabel}</Typography>
      ) : (
        <Box
          className="poster-rail"
          ref={railRef}
          onPointerDown={beginDrag}
          onPointerMove={continueDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={interceptDraggedClick}
          sx={{ cursor: dragging ? 'grabbing' : 'grab', userSelect: dragging ? 'none' : 'auto', '& img': { pointerEvents: 'none' } }}
        >
          {movies.map((movie) => <MovieCard key={movie.imdbId} movie={movie} removalPlaylist={removalPlaylist} />)}
        </Box>
      )}
    </Box>
  );
}
