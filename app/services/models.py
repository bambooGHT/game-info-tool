from pydantic import BaseModel, Field


class ResponseModel(BaseModel):
    """通用数据模型"""

    name: str = ""
    translateName: str = ""
    images: list[str] = Field(default_factory=list)
    brand: str = ""
    releaseDate: str = ""
    platform: list[str] = Field(default_factory=list)
    gameTags: list[str] = Field(default_factory=list)
    categoryTags: list[str] = Field(default_factory=list)
    langTags: list[str] = Field(default_factory=list)
    sourceUrl: str = ""
    introduction: str = ""

    def to_dict(self):
        return self.model_dump()
