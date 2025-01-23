import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface AtividadeImage {
  id: number;
  imageName: string;
  imagePath: string;
  description: string;
}

interface AtividadeImageCarouselProps {
  images: AtividadeImage[];
}

export const AtividadeImageCarousel = ({
  images,
}: AtividadeImageCarouselProps) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-construction-700">
        Imagens da Atividade
      </h3>
      <Carousel className="w-full max-w-xl mx-auto">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="p-1">
                <div className="flex flex-col space-y-2">
                  <img
                    src={`https://api.gmxindustrial.com.br${image.imagePath}`}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />

                  {image.description && (
                    <p className="text-sm text-gray-600 text-center">
                      {image.description.toString()}
                    </p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
