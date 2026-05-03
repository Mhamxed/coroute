import { ArrowRight, ArrowDown, ArrowUp } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function FAQ({ faq }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRotated, setIsRotated] = useState(false);

    return (
        <div className="gap-2 my-1 border-b-1 border-gray-300">
            <div className="flex justify-between px-4">
                <p className="my-2 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">{faq.question}</p>
                <motion.button
                    onClick={() => { 
                        setIsRotated(!isRotated)
                        setIsOpen(!isOpen)
                    }}
                    animate={{ rotate: isRotated ? 180 : 0 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    className="cursor-pointer"
                    >
                    <ArrowUp/>  
                </motion.button>
            </div>
           {isOpen && <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
            >
                <p className={`mx-auto my-6 max-w-2xl text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 ${isOpen ? "ease-in duration-400" : "" }`}>{faq.answer}</p>
            </motion.div> }
        </div>
    )
} 