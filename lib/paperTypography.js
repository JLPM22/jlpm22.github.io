// Original length-based sizing: reduce dense text modestly, then let it wrap.
export function getPaperTypography(paper) {
    const titleLength = (paper.title || '').length;
    const authorLength = (paper.authors || '').length;

    return {
        '--paper-title-size': titleLength > 95 ? '15px' : titleLength > 64 ? '16px' : '18px',
        '--paper-author-size': authorLength > 145 ? '10px' : authorLength > 105 ? '12px' : '14px',
    };
}
