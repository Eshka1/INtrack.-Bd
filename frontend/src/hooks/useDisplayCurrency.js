import { useEffect, useState } from 'react';
import { getCurrencySettings } from '../services/financeApi';

export default function useDisplayCurrency() {
  const [displayCurrency, setDisplayCurrency] = useState('BDT');
  useEffect(() => {
    let active = true;
    Promise.resolve(typeof getCurrencySettings === 'function' ? getCurrencySettings() : null)
      .then((response) => { if (active && response) setDisplayCurrency(response.data.data.displayCurrency || 'BDT'); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  return displayCurrency;
}
