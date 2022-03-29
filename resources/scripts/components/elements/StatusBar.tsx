import React from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

const BarFill = styled.div`
    ${tw`h-full bg-green-400`};
`;

export default () => {
    return (
        <div css={tw`w-36`} style={{ height: '2px' }}>
            <BarFill/>
        </div>
    );
};
