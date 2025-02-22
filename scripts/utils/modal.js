export function openModal(modalElement) {
    if (!modalElement) return;
    
    modalElement.classList.remove("hidden");
    
    // หา modal content (div ที่มี transition)
    const modalContent = modalElement.querySelector('.modal-content');
    if (modalContent) {
        setTimeout(() => {
            modalContent.classList.remove("opacity-0", "scale-75");
            modalContent.classList.add("opacity-100", "scale-100");
        }, 10);
    }
}

export function closeModal(modalElement) {
    if (!modalElement) return;
    
    // หา modal content (div ที่มี transition)
    const modalContent = modalElement.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.add("opacity-0", "scale-75");
        modalContent.classList.remove("opacity-100", "scale-100");
    }
    
    setTimeout(() => {
        modalElement.classList.add("hidden");
    }, 200);
}