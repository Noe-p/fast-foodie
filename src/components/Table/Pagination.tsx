import {
  PaginationContent,
  Pagination as PaginationBase,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationProps extends React.ComponentProps<'nav'> {
  page: number;
  setPage: (page: number) => void;
  total: number;
  pageSize?: number;
}

export function Pagination(props: PaginationProps): JSX.Element {
  const { page, setPage, total, pageSize = 10 } = props;

  const hasMore = Number(total) > pageSize * (page + 1);

  if (total <= pageSize) return <></>;

  return (
    <PaginationBase {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={page === 0}
            onClick={() => setPage(Math.max(page - 1, 0))}
          />
        </PaginationItem>
        {page !== 0 && (
          <PaginationItem>
            <PaginationLink onClick={() => setPage(Math.max(page - 1, 0))}>
              {page}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive>{page + 1}</PaginationLink>
        </PaginationItem>
        {hasMore && (
          <PaginationItem>
            <PaginationLink
              onClick={() => {
                if (hasMore) {
                  setPage(page + 1);
                }
              }}
            >
              {page + 2}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            disabled={!hasMore}
            onClick={() => {
              if (hasMore) {
                setPage(page + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationBase>
  );
}
