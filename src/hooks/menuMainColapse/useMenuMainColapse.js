import { useState } from 'react';

const useMenuMainColapse = () => {
  const [abertoMenuMain, setAbertoMenuMain] = useState(false);

  const alternarMenuMain = () => {
    setAbertoMenuMain(!abertoMenuMain);
  };

  return { abertoMenuMain, alternarMenuMain };
};

export default useMenuMainColapse;
