import { Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { BiArrowBack } from 'react-icons/bi';

export const BackButton: React.FC = (props) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <Button onClick={() => router.back()} leftIcon={<BiArrowBack />} w='min' colorScheme='blue' variant='ghost' bg='white' rounded='lg' shadow='md' {...props}>
      {t('actions.back')}
    </Button>
  );
};
