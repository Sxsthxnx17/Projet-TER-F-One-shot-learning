import { ChartBar, Circle, ScatterChart, SearchCheck, Star, Target, ChartBarBig, Eye } from 'lucide-react'
import React from 'react'

const Modele = () => {
  return (
    <section id='Modele'
    className='relative scroll-m-6 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50
    py-12 px-4 sm:py-16 md:py-12 lg:px-20'>
        <div className='max-w-6xl mx-auto'>
            <div 
            className='text-center mb-6 md:mb-8'
            data-aos='fade-down'>
                <h2 className='text-3xl sm:text-4xl md:text-5xl
                text-gray-900 '> 
                    Que fait notre  
                    <span className='text-black font-bold'> modèle</span> 
                    <span className='text-blue-900'> ?</span>
                </h2>
                <div className=' flex justify-center gap-3 mt-4'>
                        <Circle className='text-blue-500 w-5 h-5'></Circle>
                        <Circle className='text-blue-700 w-5 h-5'></Circle>
                        <Circle className='text-blue-900 w-5 h-5'></Circle>
                </div>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8
            md:gap-12 items-center'>
                <div className='relative w-full flex justify-center 
                order-2 lg:order-1'>
                    <div className='w-full max-w-md lg:max-w-lg xl:max-w-xl
                    h-[560px] md:h-[500px] lg:h-[520px] overflow-hidden
                    bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg md:shadow-xl absolute 
                    top-0 z-0 rounded-[10%_10%_20%_70%/60%_30%_70%_30%]'
                    data-aos='fade-right'
                    data-aos-delay='100'>
                    </div>
                    <div className=' relative
                    z-10 p-4 sm:p-6 w-full max-w-md '>

                        <div className='flex items-start gap-4 sm:gap-6 p-4 transition-all 
                        bg-white rounded-2xl shadow-md hover:shadow-lg mb-6'
                        data-aos='fade-right'
                        data-aos-delay='200'>
                            <div className='flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12
                            flex items-center justify-center bg-blue-100 rounded-lg'>
                                <Eye className='w-5 h-5 sm:h-6 sm:w-6
                                md:h-7 md:w-7 text-blue-600 '/>
                            </div>
                            <div>
                                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                                    Détection des Visages
                                </h3>
                                <p className='text-gray-600 text-sm sm:text-base'>
                                    YOLOv8 localise automatiquement tous les visages présents dans l'image,
                                    même dans des scènes complexes ou des foules importantes.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 sm:gap-6 p-4 transition-all 
                        bg-white rounded-2xl shadow-md hover:shadow-lg mb-6'
                        data-aos='fade-right'
                        data-aos-delay='300'>
                            <div className='flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12
                            flex items-center justify-center bg-blue-100 rounded-lg'>
                                <SearchCheck className='w-5 h-5 sm:h-6 sm:w-6
                                md:h-7 md:w-7 text-blue-600 '/>
                            </div>
                            <div>
                                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                                    Reconnaissance One-Shot
                                </h3>
                                <p className='text-gray-600 text-sm sm:text-base'>
                                    ProtoNet compare chaque visage détecté avec les embeddings de référence,
                                    permettant l'identification avec une seule photo d'entraînement.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 sm:gap-6 p-4 transition-all 
                        bg-white rounded-2xl shadow-md hover:shadow-lg'
                        data-aos='fade-right'
                        data-aos-delay='400'>
                            <div className='flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12
                            flex items-center justify-center bg-blue-100 rounded-lg'>
                                <ChartBarBig className='w-5 h-5 sm:h-6 sm:w-6
                                md:h-7 md:w-7 text-blue-600 '/>
                            </div>
                            <div>
                                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                                    Mesure de Similarité
                                </h3>
                                <p className='text-gray-600 text-sm sm:text-base'>
                                    Distance cosinus dans l'espace des embeddings pour quantifier la similarité
                                    et décider de l'identité avec un seuil de confiance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='relative order-1 lg:order-2'>
                    <div className=' bg-gradient-to-br from-blue-600 to-blue-950 rounded-2xl
                    md:rounded-3xl p-6 md:p-8 flex flex-col justify-center'
                    data-aos='zoom-in'
                    data-aos-delay='200'>
                        <div className='max-w-md mx-auto text-center text-white '>
                            <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full
                            bg-white/20 flex items-center justify-center 
                            mx-auto mb-4 sm:mb-6 '>
                                <Star className='w-8 h-8 sm:w-10 sm:h-10' ></Star>
                            </div>
                            <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>
                                Entraînement Meta-Learning
                            </h3>
                            <p className='text-sm sm:text-base mb-6'>
                                Notre modèle ProtoNet a été entraîné sur un vaste ensemble de 9000 identités 
                                pour apprendre à extraire des embeddings discriminants. Cette approche permet 
                                une généralisation exceptionnelle sur de nouvelles personnes jamais vues.
                            </p>

                            <div className='flex justify-center gap-3 sm:gap-6 flex-wrap'>
                                <div className='text-center'
                                data-aos='fade-up'
                                data-aos-delay='400'>
                                    <div className='text-2xl sm:text-3xl font-bold'>
                                        9000+
                                    </div>
                                    <div className='text-xs sm:text-sm text-blue-200'>
                                        Identités
                                    </div>
                                </div>

                                <div className='text-center'
                                data-aos='fade-up'
                                data-aos-delay='500'>
                                    <div className='text-2xl sm:text-3xl font-bold'>
                                        T4 GPU
                                    </div>
                                    <div className='text-xs sm:text-sm text-blue-200'>
                                        Google Colab
                                    </div>
                                </div>

                                <div className='text-center'
                                data-aos='fade-up'
                                data-aos-delay='600'>
                                    <div className='text-2xl sm:text-3xl font-bold'>
                                        128D
                                    </div>
                                    <div className='text-xs sm:text-sm text-blue-200'>
                                        Embeddings
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='hidden md:block absolute -top-8 -right-6
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 
                    border-blue-600 opacity-50 '
                    data-aos='zoom-in'
                    data-aos-delay='700'>
                    </div>

                    <div className='hidden md:block absolute -bottom-8 -left-14
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 
                    border-blue-900 opacity-50 '
                    data-aos='zoom-in'
                    data-aos-delay='700'>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Modele