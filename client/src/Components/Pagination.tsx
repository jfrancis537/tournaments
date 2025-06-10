import { Button } from '@mui/joy';
import styles from './Pagination.module.css';

interface PaginationProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = (props) => {

  return (
    <div className={styles.container}>
      <Button
        variant='outlined'
        className={styles.previous}
        disabled={props.page <= 1}
        onClick={() => props.onChange(props.page - 1)}
      >
        {'<'}
      </Button>
      <Button className={styles.current}>{props.page}</Button>
      <Button
        variant='outlined'
        className={styles.next}
        disabled={props.page >= props.count}
        onClick={() => props.onChange(props.page + 1)}
      >
        {'>'}
      </Button>
    </div>
  )
}