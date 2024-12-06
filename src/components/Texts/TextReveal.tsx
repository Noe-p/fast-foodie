import { motion } from 'framer-motion';

export function TextReveal(props: {
  text: string;
  className?: string;
}): JSX.Element {
  const textSplit = props.text.split(' ');

  return (
    <span className={props.className}>
      {textSplit.map((el: string, i: number) => (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.15,
            delay: i / 10,
          }}
          key={el}
          className={props.className}
        >
          {el}{' '}
        </motion.span>
      ))}
    </span>
  );
}
