import React from 'react';
import Navbar from '../components/Navbar';

const ProductDetail = () => {
    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Image */}
                    <div className="border p-4">
                        <img src="/path/to/large-image.jpg" alt="Product" className="w-full h-auto" />
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            <img src="/path/to/thumb1.jpg" alt="Thumbnail 1" className="border w-full h-auto" />
                            <img src="/path/to/thumb2.jpg" alt="Thumbnail 2" className="border w-full h-auto" />
                            <img src="/path/to/thumb3.jpg" alt="Thumbnail 3" className="border w-full h-auto" />
                            <img src="/path/to/thumb4.jpg" alt="Thumbnail 4" className="border w-full h-auto" />
                        </div>
                    </div>
                    {/* Right Column: Details and Auction */}
                    <div className="border p-4">
                        <h2 className="text-2xl font-bold">หนังสือมือสองสภาพดี</h2>
                        <p className="mt-2">ข้อมูลผู้ขาย: John Doe</p>
                        <div className="bg-gray-200 p-4 mt-4 rounded-lg">
                            <h3 className="text-xl">ราคาประมูลปัจจุบัน: <span className="font-bold">฿500</span></h3>
                            <p>เวลาที่เหลือ: <span id="countdown">10:00</span></p>
                            <input type="number" placeholder="เสนอราคา" className="border-2 border-gray-300 rounded-lg w-full mt-2 px-4 py-2" />
                            <button className="bg-blue-500 text-white rounded-lg w-full mt-2 py-2">เสนอราคา (Place Bid)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;