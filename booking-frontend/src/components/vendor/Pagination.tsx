import "./Pagination.css";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    return (
        <nav className="pagination" aria-label="Vendor results pages">
            <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
            {pages.map((page) => (
                <button type="button" key={page} className={page === currentPage ? "active" : ""} aria-current={page === currentPage ? "page" : undefined} onClick={() => onPageChange(page)}>{page}</button>
            ))}
            <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
        </nav>
    );
};

export default Pagination;
